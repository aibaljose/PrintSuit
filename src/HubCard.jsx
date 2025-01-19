import React, { useState } from "react";
import Print from "./assets/color.png"
import Modal2 from "./Modal2"
const HubCard = ({ hub }) => {
    const [Isopen, setisopen] = useState(false)
    const onSeeDetails = () => {
        

    }

    return (

        <div className="hubb">
{Isopen ? <Modal2 setisopen={setisopen} hub={hub} /> : null}
            <div className="card">

                <div className="header">
                    <div className="image">
                        active
                    </div>
                    <div className="content">
                        <img src={Print} alt={hub.name} className="hub-image" />
                        <span className="title">{hub.name}</span>
                        <p className="message">{hub.address}</p>
                        <p>
                            <strong>Rating:</strong> {hub.rating} ★
                        </p>
                    </div>
                    <div className="actions">
                        
                        

                        <div className="history cursor-pointer" onClick={()=>{setisopen(true)}}>See details</div>
                        
                        <button type="button" className="track">Print now</button>
                    </div>
                </div>
            </div>

        </div>


        // <div className="hub-card">
        //   <img src={Print} alt={hub.name} className="hub-image" />
        //   <h3>{hub.name}</h3>
        //   <p>{hub.address}</p>
        //   <p>
        //     <strong>Rating:</strong> {hub.rating} ★
        //   </p>
        //   <button className="details-btn">See Details</button>


        // </div>
    );
};

export default HubCard;
