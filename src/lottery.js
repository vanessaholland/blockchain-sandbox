import web3 from './web3';
import address from './build/address/Lottery-address';
import abi from './build/interface/Lottery-abi';

export default new web3.eth.Contract(abi, address);
