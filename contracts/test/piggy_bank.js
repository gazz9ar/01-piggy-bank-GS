const piggyBank = artifacts.require("piggyBank");
const moment = require('moment')

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("piggyBank", function (accounts) {
  
  it("should assert true", async function () {
    const contract = await piggyBank.deployed();	
    return assert.notEqual(contract.address,'0x0000000000000000000000000000000000000000');
  });

  it("verify contract parent", async function () {
    const contract = await piggyBank.deployed();

    const parentExpected = accounts[0];
    const parentReal = await contract.parent();

    return assert.equal(parentExpected,parentReal);
  });

  it("verify if parent can add new childs", async function () {
    const contract = await piggyBank.deployed();

    const childAddress = accounts[7];
    const childTargetDate = 1668285960; // timestamp
	
    await contract.addChild(childAddress, childTargetDate,{ from: accounts[0]});
    return assert.isTrue(true);
  });

  it("verify if parent can add new relatives", async function () {
    const contract = await piggyBank.deployed();

    const relativeAddress = accounts[8];  
	
    await contract.addRelatives(relativeAddress);
    return assert.isTrue(true);
  });

  it("verify stranger can't add Childs", async function () {

    const contract = await piggyBank.deployed();

    const childAddress = accounts[1];
    const badGuyAddress = accounts[5];
    const childTargetDate = 1668015740;
    
    try {
      await contract.addChild(childAddress,childTargetDate,{from:badGuyAddress});
      return assert.fail();
    } catch (error) {
      return assert.isTrue(true);
    }	
  });

  

  it("verificar que el padre pueda depositar dinero a un hijo", async function () {
    const contract = await piggyBank.deployed();

    const childAddress = accounts[2];
    const childAmount = 500; // wei

    await contract.addChild(childAddress, 1670889031);

    const prevBalance = (await contract.children(childAddress)).balance;
    await contract.deposit(childAddress, { value: childAmount });
    const currBalance = (await contract.children(childAddress)).balance;	

    return assert.equal(currBalance.toNumber(), prevBalance.toNumber() + childAmount);
  });

  it("verificar que quien solicita un retiro es un hijo válido", async function () {
    const contract = await piggyBank.deployed();
    const parent = accounts[0];

    const childAddress = accounts[3];
    const childTargetDate = moment().unix();

    await contract.addChild(childAddress, childTargetDate, { from: parent });
    await contract.deposit(childAddress, { from: parent, value: '500000000000000000' });
    await contract.withdraw('300000000000000000', { from: childAddress });   

    return assert.isTrue(true);
  });

  it("verificar que se bloquea el retiro si la cuenta no corresponde a un hijo", async function () {
    const contract = await piggyBank.deployed();
    const parent = accounts[0];

    const badGuyAddress = accounts[5];
    const childAddress = accounts[4];
    const childTargetDate = 1668285960;

    await contract.addChild(childAddress, childTargetDate, { from: parent });
    await contract.deposit(childAddress, { from: parent, value: 500 });

    try {
      await contract.withdraw(500, { from: badGuyAddress });
    }
    catch (err) {
      //console.log('BadGuy withdraw error', err.message);
      return assert.include(err.message, "Child not found");
    }

    return assert.fail("Validación incorrecta");
  });

});
