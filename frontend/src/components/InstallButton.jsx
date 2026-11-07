import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

// Shows an "Install app" button when the browser can install the PWA.
// iPhones don't fire an install event, so we show manual "Add to Home Screen" steps instead.
const InstallButton = () => {
  const [promptEvent, setPromptEvent] = useState(null);
  const [showIos, setShowIos] = useState(false);

  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setPromptEvent(e); };
    const onInstalled = () => setPromptEvent(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (standalone || (!promptEvent && !isIos)) return null;

  const install = async () => {
    if (promptEvent) {
      promptEvent.prompt();
      await promptEvent.userChoice;
      setPromptEvent(null);
    } else {
      setShowIos(true);
    }
  };

  return (
    <>
      <button className="btn secondary install-btn" onClick={install}>
        <Download size={16} /> <span className="install-label">Install app</span>
      </button>
      {showIos && (
        <div className="ios-hint" onClick={() => setShowIos(false)}>
          <b>Install on iPhone</b>
          <p>Tap the <b>Share</b> button in Safari, then choose <b>Add to Home Screen</b>.</p>
          <span className="muted">Tap to close</span>
        </div>
      )}
    </>
  );
};

export default InstallButton;
