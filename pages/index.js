import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

export default function HomePage() {
    const [ethWallet, setEthWallet] = useState(undefined);
    const [account, setAccount] = useState(undefined);
    const [atm, setATM] = useState(undefined);
    const [balance, setBalance] = useState(undefined);
    const buttonRef = useRef(null);

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const atmABI = atm_abi.abi;

    const getWallet = async () => {
        if (window.ethereum) {
            setEthWallet(window.ethereum);
        }

        if (ethWallet) {
            const account = await ethWallet.request({ method: "eth_accounts" });
            handleAccount(account);
        }
    }

    const handleAccount = (account) => {
        if (account) {
            console.log("Account connected: ", account);
            setAccount(account);
        }
        else {
            console.log("No account found");
        }
    }

    const connectAccount = async () => {
        if (!ethWallet) {
            alert('MetaMask wallet is required to connect');
            return;
        }

        const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
        handleAccount(accounts);

        // once wallet is set we can get a reference to our deployed contract
        getATMContract();
    };

    const getATMContract = () => {
        const provider = new ethers.providers.Web3Provider(ethWallet);
        const signer = provider.getSigner();
        const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

        setATM(atmContract);
    }

    const getBalance = async () => {
        if (atm) {
            const balanceInWei = await atm.getBalance();
            setBalance(ethers.utils.formatEther(balanceInWei));
        }
    }

    const deposit = async () => {
        if (atm) {
            const amount = prompt("Enter amount to be deposited");
            let tx = await atm.deposit(ethers.utils.parseEther(amount));
            await tx.wait();
            getBalance();
        }
    }

    const withdraw = async () => {
        if (atm) {
            const amount = prompt("Enter amount to be withdrawal");
            let tx = await atm.withdraw(ethers.utils.parseEther(amount));
            await tx.wait();
            getBalance();
        }
    }

    const transfer = async () => {
        if (atm) {
            const sender = prompt("Enter address where you want to transfer funds:");
            const amount = prompt("Enter amount you want to transfer");
            let tx = await atm.transfer(sender, ethers.utils.parseEther(amount));
            await tx.wait();
            getBalance();
        }
    }

    const freeze = async () => {
        if (atm) {
            let tx = await atm.freeze();
            await tx.wait();
            getBalance();
        }
    }

    const unfreeze = async () => {
        if (atm) {
            let tx = await atm.unfreeze();
            await tx.wait();
            getBalance();
        }
    }

    const requestLoan = async () => {
        if (atm) {
            const amount = prompt("Enter amount of loan to be requested");
            let tx = await atm.requestLoan(ethers.utils.parseEther(amount));
            await tx.wait();
            getBalance();
        }
    }

    const approveLoan = async () => {
        if (atm) {
            const sender = prompt("Enter address from where you want to take loan:");
            let tx = await atm.approveLoan(sender);
            await tx.wait();
            getBalance();
        }
    }

    const repayLoan = async () => {
        if (atm) {
            const sender = prompt("Enter address from where you took the loan:");
            const amount = prompt("Enter amount you want to repay");
            let tx = await atm.repayLoan(sender, ethers.utils.parseEther(amount));
            await tx.wait();
            getBalance();
        }
    }


    const handleMouseMove = (event) => {
        const button = buttonRef.current;
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        button.style.setProperty('--mouse-x', `${x}px`);
        button.style.setProperty('--mouse-y', `${y}px`);
    }

    const initUser = () => {
        // Check to see if user has Metamask
        if (!ethWallet) {
            return <p>Please install Metamask in order to use this ATM.</p>
        }

        // Check to see if user is connected. If not, connect to their account
        if (!account) {
            return (
                <>
                <h3 className={styles.con_btn_title}>Please connect your Metamask wallet</h3>
                <button ref={buttonRef} className={styles.con_btn} onClick={connectAccount} onMouseMove={handleMouseMove}>
                <span className={styles.con_btn_content}>
                    Link <FontAwesomeIcon icon={faLink}/>
                </span>
                </button>
                </>
            )
        }

        if (balance == undefined) {
            getBalance();
        }

        return (
            <div className={styles.acc_folio}>
                <div className={styles.acc_details}>
                    <p><b>Your Account: <div className={styles.wallet_address}>{account}</div></b></p>
                    <p><b>Your Balance: {balance} ETH</b></p>
                </div>
                <div className={styles.transactions}>
                    <button className={styles.tr_child} onClick={deposit}><b>Deposit</b></button>
                    <button className={styles.tr_child} onClick={withdraw}><b>Withdraw</b></button>
                    <button className={styles.tr_child} onClick={transfer}><b>Transfer</b></button>
                    <button className={styles.tr_child} onClick={freeze}><b>Freeze</b></button>
                    <button className={styles.tr_child} onClick={unfreeze}><b>Unfreeze</b></button>
                    <button className={styles.tr_child}><b>Coming soon!!!</b></button>
                </div>
                <div className={styles.loan}>
                    <button className={styles.loan_child} onClick={requestLoan}><b>Request Loan</b></button>
                    <button className={styles.loan_child} onClick={approveLoan}><b>Approve Loan</b></button>
                    <button className={styles.loan_child} onClick={repayLoan}><b>Repay Loan</b></button>
                </div>
            </div>
        )
    }

    useEffect(() => { getWallet(); }, []);

    return (
        <main className={styles.container}>
            <header className={styles.header}><h1>Welcome to the Mukul's ATM!</h1></header>
            {initUser()}
        </main>
    )
}
