import web3 from './web3';
import address from './build/address/Lottery-address';
import abi from './build/interface/Lottery-abi';

// const address = fs.readFile('/build/address/Lottery-address.txt', function (err) {
//     if (err) throw err;
// });
// const abi = fs.readFile('/build/interface/Lottery-abi.txt', function (err) {
//     if (err) throw err;
// });

export default new web3.eth.Contract(abi, address);
