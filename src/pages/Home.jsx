import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import WelcomeScreen from '../components/WelcomeScreen';
import ThankYouScreen from '../components/ThankYouScreen';
import EmailVerification from '../components/EmailVerification';
import ProcessingScreen from '../components/ProcessingScreen';
import CertificateFound from '../components/CertificateFound';
import CertificateNotFound from '../components/CertificateNotFound';
import CertificateViewer from '../components/CertificateViewer';

import { verifyCertificate, getCertificateBlobUrl } from '../services/api';
import { normalizeEmail } from '../utils/emailValidator';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const [screen, setScreen] = useState('welcome'); // welcome | thankyou | verification | processing | found | not_found
  const [email, setEmail] = useState('');
  const [participant, setParticipant] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [systemError, setSystemError] = useState('');

  // API Call verification results cached during processing
  const [pendingResult, setPendingResult] = useState(null);
  const [pendingError, setPendingError] = useState(null);

  // Normal Page Transitions
  const handleWelcomeNext = () => setScreen('thankyou');
  const handleThankYouNext = () => setScreen('verification');
  const handleThankYouBack = () => setScreen('welcome');
  const handleVerificationBack = () => {
    setSystemError('');
    setScreen('thankyou');
  };

  // Run certificate check and cash results/errors
  const handleVerifyEmail = async (rawEmail) => {
    setSystemError('');
    setPendingResult(null);
    setPendingError(null);

    const normalized = normalizeEmail(rawEmail);
    setEmail(normalized);
    setScreen('processing');

    try {
      const result = await verifyCertificate(normalized);
      setPendingResult(result);
    } catch (err) {
      console.error('Verification request error:', err);
      // Differentiate Network vs Server error
      if (err.message.includes('Failed to fetch') || !navigator.onLine) {
        setPendingError('Unable to connect. Please check your internet connection.');
      } else {
        setPendingError(err.message || 'Something went wrong while checking your certificate. Please try again.');
      }
    }
  };

  // Called when the 3-second Processing animation finishes
  const handleProcessingComplete = async () => {
    if (pendingError) {
      setSystemError(pendingError);
      setScreen('verification');
      return;
    }

    if (pendingResult) {
      if (pendingResult.found) {
        if (pendingResult.error) {
          // Found but certificate not available yet
          setSystemError(pendingResult.error);
          setScreen('verification');
        } else {
          setParticipant(pendingResult);
          setScreen('found');
          
          // Prefetch the PDF Blob URL for secure preview
          try {
            const url = await getCertificateBlobUrl(email, pendingResult.certificate, pendingResult.signature);
            setBlobUrl(url);
          } catch (blobErr) {
            console.error('Error prefetching PDF Blob:', blobErr);
          }
        }
      } else {
        setScreen('not_found');
      }
    } else {
      // If network call is still pending, wait briefly or default to error
      setSystemError('Something went wrong while checking your certificate. Please try again.');
      setScreen('verification');
    }
  };

  const handleRetry = () => {
    setParticipant(null);
    setBlobUrl(null);
    setSystemError('');
    setScreen('verification');
  };

  const handleOpenViewer = () => {
    if (blobUrl) {
      setIsViewerOpen(true);
    } else {
      // If blob is still loading, try downloading it again
      const reloadBlob = async () => {
        try {
          const url = await getCertificateBlobUrl(email, participant.certificate, participant.signature);
          setBlobUrl(url);
          setIsViewerOpen(true);
        } catch (err) {
          alert('Could not open the certificate viewer. Please try downloading it directly.');
        }
      };
      reloadBlob();
    }
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
  };

  // Render the current screen with page transitions
  const renderActiveScreen = () => {
    switch (screen) {
      case 'welcome':
        return <WelcomeScreen onNext={handleWelcomeNext} />;
      case 'thankyou':
        return <ThankYouScreen onNext={handleThankYouNext} onBack={handleThankYouBack} />;
      case 'verification':
        return (
          <div className="w-full flex flex-col items-center">
            {/* System/Network Error Banner */}
            <AnimatePresence>
              {systemError && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full max-w-xl mx-auto mb-4 flex items-center gap-3 text-red-400 bg-red-950/20 border border-red-900/30 py-4 px-6 rounded-2xl text-sm"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="font-light">{systemError}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <EmailVerification onVerify={handleVerifyEmail} onBack={handleVerificationBack} />
          </div>
        );
      case 'processing':
        return <ProcessingScreen onComplete={handleProcessingComplete} />;
      case 'found':
        return (
          <CertificateFound
            participant={participant}
            email={email}
            onView={handleOpenViewer}
            onBack={handleRetry}
          />
        );
      case 'not_found':
        return <CertificateNotFound onRetry={handleRetry} />;
      default:
        return <WelcomeScreen onNext={handleWelcomeNext} />;
    }
  };

  // Page Transition variants
  const slideVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="w-full min-h-[90vh] flex flex-col justify-center items-center py-6">
      {/* Active Screen Slider */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="w-full"
          >
            {renderActiveScreen()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fullscreen PDF Viewer Overlay */}
      {isViewerOpen && participant && (
        <CertificateViewer
          participant={participant}
          email={email}
          blobUrl={blobUrl}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
}
