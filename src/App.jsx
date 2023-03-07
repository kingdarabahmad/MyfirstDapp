import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractAbi } from "./contractAbi";

function App() {
  const contractAddress = "0x4BBF636b464fd94805B5ba86e3717fA9f9b83814";
  const [show, setShow] = useState(false);
  const [contractInfo, setContractInfo] = useState({
    provider: null,
    signer: null,
    contract: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [msgList, setMsgList] = useState([]);
  const [isSuccess, setIsSuccess] = useState({
    status: false,
    msg: "",
  });
  const [formData, setFormData] = useState({
    addressTo: "",
    ethers: "",
    msg: "",
  });

  //intializes the provider,signer,contract when first time page mounts
  useEffect(() => {
    const intilialize = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      setContractInfo({
        provider,
        signer,
        contract,
      });
    };
    intilialize();
  }, [contractInfo.contract]);

  //this function will transfer eth to given address
  const writeContract = async () => {
    const { contract } = contractInfo;
    setIsSuccess({
      status: true,
      msg: "",
    });
    const result = await contract.sendEthUser(
      `${formData.addressTo}`,
      formData.msg,
      {
        value: ethers.utils.parseEther(formData.ethers),
      }
    );
    setIsLoading(true);
    await result.wait();
    setIsLoading(false);
    if (result.hash) {
      setIsSuccess({
        status: false,
        msg: "Ethers sent Successfully",
      });
      setFormData({
        addressTo: "",
        ethers: "",
        msg: "",
      });
    } else {
      setIsSuccess({
        status: false,
        msg: "Sending Unsuccessfull Try again",
      });
    }
  };

  // this function will get all the messages by user
  const getMsgList = async () => {
    const { contract } = contractInfo;
    const messages = await contract.getPeopleArray();
    setMsgList(messages);
  };

  //handle the input values
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  //handles the form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormData(formData);
  };

  return (
    <div className="app">
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="addressTo"
          placeholder="Write address you want to send ethers"
          value={formData.addressTo}
          onChange={handleChange}
        />
        <input
          type="text"
          name="ethers"
          placeholder="Enter amount ethers you want to send"
          value={formData.ethers}
          onChange={handleChange}
        />
        <input
          type="text"
          name="msg"
          value={formData.msg}
          placeholder="Send your Message"
          onChange={handleChange}
        />
        <input
          type="submit"
          value={isLoading ? "Sending.." : "Send"}
          onClick={() => writeContract()}
        />
        {isSuccess.status === false ? (
          <h1 className="successMsg">{isSuccess.msg}</h1>
        ) : null}
      </form>
      <div>
        <button
          onClick={() => {
            getMsgList();
            setShow(!show);
          }}
        >
          List of Messages
        </button>
        {show &&
          msgList.map((array, i) => (
            <div className="msg">
              <p>{i + 1}..</p>
              <div key={i}>{array[1]}</div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
