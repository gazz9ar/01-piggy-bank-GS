// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract piggyBank {
	
	struct Child {
		uint256 balance;
		uint256 targetDate;		
	}
	address public parent;
	mapping (address  => Child) public children;	
    mapping (address  => bool) public isRelative;

    modifier onlyRelatives {
      require(msg.sender == parent || isRelative[msg.sender], 'Only relatives' );
      _;
   }

	constructor() {		
		parent = msg.sender;
	}

  function addRelatives(address _relativeAccount) public onlyRelatives  {
        isRelative[_relativeAccount] = true;
   }

  function addChild(address _account, uint256 _targetDate) public onlyRelatives {

    // require(children[_account].targetDate != 0,'This child already exists');
    require(block.timestamp <= _targetDate,'Enter a valid date');	

    children[_account] = Child(0,_targetDate);	
    }

  function deposit(address _account) payable external onlyRelatives {
    
      children[_account].balance += msg.value;
  }

  function withdraw(uint256 _amount) external {
        // require(children[msg.sender].account == msg.sender, "Child not found");
        require(
            children[msg.sender].targetDate > 0,
            "#PB001 - Child not found"
        );

        // verificar que tenga un monto acumulado (suficiente, considerando retiros parciales)
        require(
            children[msg.sender].balance >= _amount,
            "#PB002 - Insufficient funds"
        );

        // verificar que haya alcanzado la fecha objetivo
        require(
            children[msg.sender].targetDate <= block.timestamp,
            "#PB003 - Too early"
        );

        children[msg.sender].balance -= _amount;
        payable(msg.sender).transfer(_amount);
    }

 

}
