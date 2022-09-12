import { React, Component } from "react";
import web3 from "../web3";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

class LotteryEntry extends Component {
    render() {
        return (
            <Form onSubmit={this.props.onSubmit}>
                <h4>Enter to win</h4>
                <h3>Costs {web3.utils.fromWei(this.props.ticketPriceInWei, 'ether')} Ether to enter</h3>
                <Form.Group className="mb-3" controlId="formAccount">
                    <Form.Label>Account to enter with</Form.Label>
                    <Form.Control type="email" placeholder="0x0000" onChange={this.props.onChange}/>
                    <Form.Text className="text-muted">
                    We'll never share your info with anyone else.
                    </Form.Text>
                </Form.Group>
                <Button variant="primary" type="submit">
                    Enter
                </Button>
            </Form>
        );
    }
};

export default LotteryEntry;
