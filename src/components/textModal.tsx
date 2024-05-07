import { useState, useEffect } from "react";

export function Modal({
  show,
  branoId,
  hideModal,
}: {
  branoId: string;
  show: boolean;
  hideModal: () => void;
}) {
  const [brano, setBrano] = useState("");

  useEffect(() => {
    fetch(`https://domande-ap.mur.gov.it/api/v1/domanda/brano/${branoId}`)
      .then((res) => res.json())
      .then((data) => setBrano(data.brano));
  }, [branoId]);
  return (
    <div
      id="default-modal"
      tabIndex={-1}
      aria-hidden="true"
      className={`${
        !show && "hidden"
      } flex overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 max-h-full bg-black bg-opacity-50`}
    >
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg shadow max-h-[80vh] overflow-y-auto">
          <button className="px-4 pt-4 mr-0 ml-auto" onClick={hideModal}>
            X
          </button>
          <div className="p-4 space-y-4">
            <p className="text-base leading-relaxed text-gray-500">{brano}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
