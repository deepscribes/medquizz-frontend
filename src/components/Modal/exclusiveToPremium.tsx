import { Modal } from ".";

export function PremiumModal(props: { setShowModal: (show: boolean) => void }) {
  return (
    <Modal>
      <div className="flex flex-row gap-x-2">
        <h1 className="text-3xl w-full flex-grow font-semibold text-text-cta text-center">
          🔒 Funzionalità Premium!
        </h1>
        <button
          onClick={() => {
            props.setShowModal(false);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <p className="text-lg my-6 text-text-cta text-center">
        Questa funzione è disponibile solo per gli utenti premium.
        <a href="/#pricing" className="text-primary">
          Esplora i nostri piani
        </a>{" "}
        per accedere a tutte le funzionalità avanzate e migliorare la tua
        esperienza.
      </p>
      <img
        src="https://medquizz.s3.eu-south-1.amazonaws.com/icons/crying_pepe.png"
        alt="Illustrazione di sicurezza"
        className="h-64 object-contain aspect-square mx-auto"
      />
    </Modal>
  );
}
