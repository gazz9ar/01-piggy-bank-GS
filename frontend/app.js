
const contractAddress = '0xEb95E88dbB2037e6249eDd82bA96f8A930ac6ffd';
const contractAbi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "children",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "targetDate",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isRelative",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "parent",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_relativeAccount",
        "type": "address"
      }
    ],
    "name": "addRelatives",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_targetDate",
        "type": "uint256"
      }
    ],
    "name": "addChild",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
let loggedAccountAddress = '';
let contractInstance;

const updateAccountInfo = (account) => {
    const pNotLoggedIn = document.getElementById('message-not-logged-in');
    const pLoggedIn = document.getElementById('message-logged-in');
    const spanAccount = document.getElementById('user-account');
    const parentTab = document.getElementById('parent-tab');
    const childTab = document.getElementById('child-tab');
   
    if (account.length > 0) {      
        if (account[0] != '0x800b4630D5eD08d5acF32f8fCB1ab4642C7Cbe2a'.toLowerCase()) {
          parentTab.style.display = 'none';
          childTab.click();
        } else {
          parentTab.style.display = 'block';
          parentTab.click();
        }
        pNotLoggedIn.style.display = 'none';
        pLoggedIn.style.display = 'block';
        spanAccount.innerText = account;
    } else {
        pNotLoggedIn.style.display = 'block';
        pLoggedIn.style.display = 'none';
        spanAccount.innerText = '';
    }
}

const login = async () => {
    if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const account = await provider.send("eth_requestAccounts", []);       
        updateAccountInfo(account);

        window.ethereum.on("accountsChanged", (account) => {         
            updateAccountInfo(account);
        });

        const signer = provider.getSigner();
        contractInstance = new ethers.Contract(contractAddress, contractAbi, signer, provider);    
    }
    else {
        throw Error('Metamask must be installed in your browser.');
    }
};

const addRelative = async () => {
  const account = document.getElementById('add-relative-account').value;

  if (contractInstance) {
    await contractInstance.addRelatives(account);  
  } else {
    window.alert('You must be logged in with Metamask.')
  }	
}

const addChild = async () => {

    const account = document.getElementById('add-child-account').value;
    let targetDate = moment(document.getElementById('add-child-date').value).unix();	

	if (contractInstance) {
		await contractInstance.addChild(account,targetDate);
	} else {
		window.alert('You must be logged in with Metamask.')
	}	
};

const sendMoney = async () => {
    const account = document.getElementById('send-money-account').value;
    const amount = document.getElementById('send-money-amount').value;   

    if (contractInstance) {
      let depositResponse =  await contractInstance.deposit(account, { value: amount });	
    }
    else {
        throw Error('You must be logged in with Metamask.');
    }
};

const getParentBalance = async () => {  
  const account = document.getElementById('parent-balance-account').value;   

    if (contractInstance) {
        const child = await contractInstance.children(account);       
        const amount = child.balance.toString();      
        document.getElementById('parent-balance-value').value = amount;
    }
    else {
        throw Error('You must be logged in with Metamask.');
    }
};

const withdraw = async () => {
  const amount = document.getElementById('withdraw-amount').value;

  if (contractInstance) {
      try {
          await contractInstance.withdraw(amount);
      }
      catch (err) {          
          if (err.message.indexOf('#PB001 - Child not found') >= 0) {
              alert('Child not found');
          }
          if (err.message.indexOf('#PB002 - Insufficient funds') >= 0) {
              alert('Insufficient funds');
          }
      }
  }
  else {
      throw Error('You must be logged in with Metamask.');
  }
};
