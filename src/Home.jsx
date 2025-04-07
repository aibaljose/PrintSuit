import React, { useState } from 'react';
import printer from "./assets/printer.png"
import { useNavigate } from 'react-router-dom';
import LoginModal from './loginmodal';
import SignupModal from './SignupModal';
import Nav from './nav';

const Home = () => {
    const navigate = useNavigate();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [userDetails1, setuserDetails1] = useState(false);
    const [isSignupOpen, setIsSignupOpen] = useState(false);

    const switchToLogin = () => {
        setIsSignupOpen(false);
        setIsLoginOpen(true);
    };
    
    const switchToSignup = () => {
        setIsLoginOpen(false);
        setIsSignupOpen(true);
    };
    const handleUserDetailsUpdate = (details) => {
        setuserDetails1(details);
        console.log('User Details in Home:', details);
        // You can now use userDetails in your Home component
    };
    return (
        <div className='Home pt-14 lg:pt-0'>
            <Nav switchToSignup={switchToLogin} onUserDetailsUpdate={handleUserDetailsUpdate} />

            <div className="bg-white">
                <LoginModal 
                    isOpen={isLoginOpen}
                    onClose={() => setIsLoginOpen(false)}
                    navigate={navigate}
                    switchToSignup={switchToSignup}
                />

                <SignupModal
                    isOpen={isSignupOpen}
                    onClose={() => setIsSignupOpen(false)}
                    navigate={navigate}
                    switchToLogin={switchToLogin}
                />

                <div className="relative isolate px-8 pt-4 lg:px-8">
                    {/* Gradient elements preserved */}
                    <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                            style={{
                                clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
                            }}>
                        </div>
                    </div>

                    <div className="mx-auto max-w-2xl py-10 sm:py-20 lg:py-40">
                        <div className="hidden sm:mb-8 sm:flex sm:justify-center column">
                            <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                                New: Self-service printing hubs now available 24/7.{" "}
                                <a href="#" className="font-semibold text-indigo-600">
                                    <span className="absolute inset-0" aria-hidden="true"></span>
                                    Find locations <span aria-hidden="true">&rarr;</span>
                                </a>
                            </div>
                        </div>

                        <div className="text-center">
                            <h1 className="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
                                Print On-Demand at Your Nearest Hub
                            </h1>
                            <p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
                                Upload documents, select a convenient print hub, and collect your prints anytime. Our automated self-service system ensures your documents are ready when you are, with real-time notifications for pickup.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <a onClick={() =>{
                                    if(!userDetails1){
                                        setIsLoginOpen(true)
                                    }
                                    else{
                                        navigate("/locate")
                                    }
 
                                }}
                                    href="#"
                                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    Start Printing{console.log(userDetails1)}
                                </a>
                                <a href="#" className="text-sm/6 font-semibold text-gray-900">
                                    View Hub Locations <span aria-hidden="true">→</span>
                                </a>
                            </div>
                        </div>

                        <div className="flex justify-center items-center">
                            <img src={printer} alt="Smart Printing Hub" height="300" width="300" />
                        </div>
                    </div>

                    {/* Bottom gradient preserved */}
                    <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
                        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                            style={{
                                clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
                            }}>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features section */}
            <div className="bg-gray-50 py-24 sm:py-32">
                <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
                    <h2 className="text-center text-base/7 font-semibold text-indigo-600">Smart Printing Solutions</h2>
                    <p className="mx-auto mt-2 max-w-lg text-balance text-center text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
                        Print Smarter, Not Harder
                    </p>
                    <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
                        <div className="relative lg:row-span-2">
                            <div className="absolute inset-px rounded-lg bg-white lg:rounded-l-[2rem]"></div>
                            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
                                <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                                        24/7 Accessibility
                                    </p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                                        Print at your convenience with our self-service hubs available round the clock. Upload documents from anywhere and pick them up when ready.
                                    </p>
                                </div>
                                {/* Rest of the mobile-friendly section preserved */}
                            </div>
                        </div>

                        <div className="relative max-lg:row-start-1">
                            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-[2rem]"></div>
                            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
                                <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">Smart Notifications</p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                                        Receive real-time updates about your print job status and pickup notifications directly on your device.
                                    </p>
                                </div>
                                {/* Performance section content preserved */}
                            </div>
                        </div>

                        <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
                            <div className="absolute inset-px rounded-lg bg-white"></div>
                            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
                                <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">Secure Printing</p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                                        Your documents are encrypted and securely processed. Only you can access your prints with our verified pickup system.
                                    </p>
                                </div>
                                {/* Security section content preserved */}
                            </div>
                        </div>

                        <div className="relative lg:row-span-2">
                            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
                            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
                                <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                                        Smart Hub Network
                                    </p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                                        Find the nearest print hub with our location-based search. Multiple locations ensure you're never far from a printer.
                                    </p>
                                </div>
                                {/* API section content preserved */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home