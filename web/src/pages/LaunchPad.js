import React from 'react'
import ArrowRight from 'apollo-react-icons/ArrowRight';
import Button from 'apollo-react/components/Button';
import Typography from 'apollo-react/components/Typography';
import './LaunchPad.css'

function LaunchPad() {
    return (
        <div>
            <div className="header">
                <div>
                <p>Welcome, Oliver Queen</p>
                <h2 >Harness the power of your clinical data</h2>
                <Button variant="secondary" icon={ArrowRight} style={{ marginRight: 10 }}> Quick Link to Study Admin </Button>
                </div>
            </div>
            <div className="productBox">
                
                <p>Clinical Data Ingestion</p>
            </div>
        </div>
    )
}

export default LaunchPad
