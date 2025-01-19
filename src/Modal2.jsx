import React from 'react'

const Modal2 = ({ setisopen, hub }) => {
    return (
        <div>



            <div
                id="default-modal" onClick={() => setisopen(false)}
                className="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[100%] max-h-full backdrop-blur-sm bg-gray-500 bg-opacity-50"
            >
                <div className="relative flex justify-center items-center p-4 w-full max-w-2xl max-h-full">
                    <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-xs font-serif">
                        <div className="relative">X</div>
                        <div className="mt-4 text-center">
                            <div className="text-2xl font-semibold text-gray-900 font-mono">
                                {hub.name}
                            </div>
                            <div className="mt-2 text-gray-600">
                                <div className="content">
                                    <span className="title">{hub.name}</span>
                                    <p className="message">{hub.address}</p>
                                    <p>
                                        <strong>Rating:</strong> {hub.rating} ★
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setisopen(false)}
                                className="mt-6 px-4 py-2 border-2 border-[#00c4b4] text-sm w-full rounded shadow-md transition ease-out duration-300 hover:scale-95"
                            >
                                Learn More
                            </button>
                            <button
                                onClick={() => setisopen(false)}
                                className="mt-6 px-4 py-2 border-2 border-[#00c4b4] text-sm w-full rounded shadow-md transition ease-out duration-300 hover:scale-95"
                            >
                                Learn More
                            </button>
                            <button

                                className="mt-6 px-4 py-2 border-2 border-[#00c4b4] text-sm w-full rounded shadow-md transition ease-out duration-300 hover:scale-95"
                            >
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    )
}

export default Modal2
