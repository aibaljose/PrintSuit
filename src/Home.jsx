import React from 'react'
import printer from "./assets/printer.png"
import Print from "./assets/Print.png"
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Nav from './nav';
const Home = () => {
    return (
        <div className='Home'>
            <Nav/>
            <div className="hero pl-[125px] pr-[125px] mt-[80px] flex justify-between gap-20px items-center">
                <div className="hero1">
                    <div className="title text-[47px] font-bold">Print Anytime, <span className='pl-[6px] pr-[6px] bg-[#ffc727] rounded-lg' >Anywhere</span>  <br /> Seamlessly and Securely"</div>

                    <p className='text-[24px]'>Your one-stop solution for hassle-free remote printing.<br /> Find printers near you, upload files, and <br /> manage print jobs with ease.</p>
                    <div className="btnlist flex gap-[30px]">


                       <Link style={{textDecoration: 'none'}} to="/login"><button id="bottone1" className='mt-[20px]'><strong>Get stated</strong></button></Link> 
                        <button id="bottone1" className='mt-[20px]'><strong>Learn More</strong></button>
                    </div>
                </div>
                <div className="hero2">
                    <img className='max-h-[400px]' src={Print} alt="" />
                </div>


            </div>

        </div>
    )
}

export default Home
