import React from "react";

const PickWinner = (props) => {
    return (
        <div>
            <h4>Ready to pick a winner?</h4>
            <button onClick={props.onClick}>Pick a winner!</button>
        </div>
    );
}

export default PickWinner;
