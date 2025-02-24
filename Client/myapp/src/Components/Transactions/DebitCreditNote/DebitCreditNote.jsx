import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AccountMasterHelp from "../../../Helper/AccountMasterHelp";
import GSTRateMasterHelp from "../../../Helper/GSTRateMasterHelp";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import ActionButtonGroup from "../../../Common/CommonButtons/ActionButtonGroup";
import NavigationButtons from "../../../Common/CommonButtons/NavigationButtons";
import SystemHelpMaster from "../../../Helper/SystemmasterHelp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./DebitCreditNote.css";
import { HashLoader } from "react-spinners";
import {
  TextField,
  Grid
} from '@mui/material';

// Global Variables
var newDcid = "";
var BillFromName = "";
var BillFormCode = "";
var BillToName = "";
var BillToCode = "";
var GSTName = "";
var GSTCode = "";
var MillName = "";
var MillCode = "";
var ShipToName = "";
var ShipToCode = "";
var ExpAcaccountName = "";
var ExpAcaccountCode = "";
var ItemCodeName = "";
var ItemCodeDetail = "";
var selectedfilter = "";
var HSN = "";
var CGSTRate = 0.0;
var SGSTRate = 0.0;
var IGSTRate = 0.0;

const API_URL = process.env.REACT_APP_API;
const companyCode = sessionStorage.getItem("Company_Code");
const Year_Code = sessionStorage.getItem("Year_Code");

const DebitCreditNote = () => {
  // Detail Help State Management
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState({});
  const [deleteMode, setDeleteMode] = useState(false);
  const [expacCode, setExpacCode] = useState("");
  const [expacAccoid, setExpacAccoid] = useState("");
  const [expacName, setExpacName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [itemCodeAccoid, setItemCodeAccoid] = useState("");
  const [itemName, setItemName] = useState("");
  const [hsnNo, setHSNNo] = useState("");
  const [gstId, setGstId] = useState("");
  const [formDataDetail, setFormDataDetail] = useState({
    value: 0.0,
    Quantal: "",
  });

  // Head Section State Managements
  const [addOneButtonEnabled, setAddOneButtonEnabled] = useState(false);
  const [saveButtonEnabled, setSaveButtonEnabled] = useState(true);
  const [cancelButtonEnabled, setCancelButtonEnabled] = useState(true);
  const [editButtonEnabled, setEditButtonEnabled] = useState(false);
  const [deleteButtonEnabled, setDeleteButtonEnabled] = useState(false);
  const [backButtonEnabled, setBackButtonEnabled] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [highlightedButton, setHighlightedButton] = useState(null);
  const [cancelButtonClicked, setCancelButtonClicked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastTenderDetails, setLastTenderDetails] = useState([]);
  const [lastTenderData, setLastTenderData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // In utility page record doubleClicked that record show for edit functionality
  const location = useLocation();
  const selectedRecord = location.state?.selectedRecord;
  const handleTransType = location.state?.tran_type;

  console.log("handleTransType", handleTransType)


  const navigate = useNavigate();
  const setFocusTaskdate = useRef(null);
  selectedfilter = location.state?.selectedfilter;
  const [tranType, setTranType] = useState(selectedfilter);
  const [isHandleChange, setIsHandleChange] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cgstRate, setCgstRate] = useState(0.0);
  const [sgstRate, setSgstRate] = useState(0.0);
  const [igstRate, setIgstRate] = useState(0.0);

  const initialFormData = {
    doc_no: "",
    doc_date: new Date().toISOString().split("T")[0],
    ac_code: "",
    bill_no: "",
    bill_date: new Date().toISOString().split("T")[0],
    bill_id: "",
    bill_type: "",
    texable_amount: 0.0,
    gst_code: "",
    cgst_rate: 0.0,
    cgst_amount: 0.0,
    sgst_rate: 0.0,
    sgst_amount: 0.0,
    igst_rate: 0.0,
    igst_amount: 0.0,
    bill_amount: 0.0,
    Company_Code: companyCode,
    Year_Code: Year_Code,
    Branch_Code: "",
    Created_By: "",
    Modified_By: "",
    misc_amount: 0.0,
    ac: "",
    ASNNO: "",
    Ewaybillno: "",
    Narration: "",
    Shit_To: 0,
    Mill_Code: 0,
    st: 0,
    mc: 0,
    ackno: "",
    Unit_Code: 0,
    uc: 0,
    TCS_Rate: 0.0,
    TCS_Amt: 0.0,
    TCS_Net_Payable: 0.0,
    TDS_Rate: 0.0,
    TDS_Amt: 0.0,
    IsDeleted: 1,
  };

  // Head data functionality code.
  const [formData, setFormData] = useState(initialFormData);
  const [billFrom, setBillFrom] = useState("");
  const [billTo, setBillTo] = useState("");
  const [mill, setMill] = useState("");
  const [shipTo, setShipTo] = useState("");
  const [gstCode, setGstCode] = useState("");
  const [GstRate, setGstRate] = useState(0.0);
  const [matchStatus, setMatchStatus] = useState(null);

  const handleChange = async (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleKeyDownCalculations = async (event) => {
    if (event.key === "Tab") {
      const { name, value } = event.target;
      let gstRate = GstRate;
      if (!gstRate || gstRate === 0) {
        const cgstRate = parseFloat(formData.cgst_rate) || 0;
        const sgstRate = parseFloat(formData.sgst_rate) || 0;
        const igstRate = parseFloat(formData.igst_rate) || 0;
        gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
      }
      const updatedFormData = await calculateDependentValues(
        name,
        value,
        formData,
        matchStatus,
        gstRate
      );
      setFormData(updatedFormData);
    }
  };

  const handleDateChange = (event, fieldName) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: event.target.value,
    }));
  };

  useEffect(() => {
    if (isHandleChange) {
      handleCancel();
      setIsHandleChange(false);
    }
    setFocusTaskdate.current.focus();
  }, [tranType]);

  // Fetch Last Record Doc No from database
  const fetchLastRecord = () => {
    fetch(
      `${API_URL}/get-lastdebitcreditnotedata?Company_Code=${companyCode}&Year_Code=${Year_Code}&tran_type=${tranType || handleTransType}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch last record");
        }
        return response.json();
      })
      .then((data) => {
        const newDocNo =
          data.last_head_data && data.last_head_data.doc_no
            ? data.last_head_data.doc_no + 1
            : 1;
        setFormData((prevState) => ({
          ...prevState,
          doc_no: newDocNo,
        }));
        setTranType(
          data.last_head_data && data.last_head_data.tran_type
            ? data.last_head_data.tran_type
            : tranType
        );
      })
      .catch((error) => {
        toast.error("Error fetching last record:", error);
      });
  };

  // Handle Add button Functionality
  const handleAddOne = async () => {
    setBillFrom("");
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setIsEditMode(false);
    setIsEditing(true);
    fetchLastRecord();
    setFormData(initialFormData);
    setTranType();
    BillFromName = "";
    BillFormCode = "";
    BillToName = "";
    BillToCode = "";
    GSTName = "";
    GSTCode = "";
    MillName = "";
    MillCode = "";
    ShipToName = "";
    ShipToCode = "";
    setLastTenderDetails([]);
  };

  // Handle Edit button Functionality
  const handleEdit = () => {
    setIsEditMode(true);
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setBackButtonEnabled(true);
    setIsEditing(true);
  };

  // Handle New record insert in database and update the record Functionality
  const handleSaveOrUpdate = async () => {
    setIsEditing(true);
    setIsLoading(true);
    const headData = {
      ...formData,
      gst_code: gstCode || GSTCode,
      tran_type: tranType,
    };
    if (isEditMode) {
      delete headData.dcid;
    }
    const detailData = users.map((user) => ({
      rowaction: user.rowaction,
      dcdetailid: user.dcdetailid,
      expac_code: user.expac_code,
      tran_type: tranType,
      value: user.value,
      expac: user.expac,
      detail_Id: 1,
      company_code: companyCode,
      year_code: Year_Code,
      Item_Code: user.Item_Code,
      Quantal: user.Quantal,
      ic: user.ic,
    }));

    const requestData = {
      headData,
      detailData,
    };

    try {
      if (isEditMode) {
        const updateApiUrl = `${API_URL}/update-debitCreditnote?dcid=${newDcid}`;
        const response = await axios.put(updateApiUrl, requestData);

        toast.success("Data updated successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const response = await axios.post(
          `${API_URL}/insert-debitcreditnote`,
          requestData
        );
        toast.success("Data saved successfully!");
        setIsEditMode(false);
        setAddOneButtonEnabled(true);
        setEditButtonEnabled(true);
        setDeleteButtonEnabled(true);
        setBackButtonEnabled(true);
        setSaveButtonEnabled(false);
        setCancelButtonEnabled(false);
        setIsEditing(true);

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      toast.error("Error occurred while saving data");
    } finally {
      setIsEditing(false);
      setIsLoading(false);
    }
  };

  // Handle Delete the record from database functionality
  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete this record ${formData.doc_no}?`
    );
    if (isConfirmed) {
      setIsEditMode(false);
      setAddOneButtonEnabled(true);
      setEditButtonEnabled(true);
      setDeleteButtonEnabled(true);
      setBackButtonEnabled(true);
      setSaveButtonEnabled(false);
      setCancelButtonEnabled(false);
      setIsLoading(true);
      try {
        const deleteApiUrl = `${API_URL}/delete_data_by_dcid?dcid=${newDcid}&Company_Code=${companyCode}&doc_no=${formData.doc_no}&Year_Code=${Year_Code}&tran_type=${tranType}`;
        const response = await axios.delete(deleteApiUrl);
        if (response.status === 200) {
          if (response.data) {
            toast.success("Data delete successfully!");
            handleCancel();
          } else if (response.status === 404) {
            toast.error("No data found");
          }
        } else {
          toast.error(
            "Failed to delete tender:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        toast.error("Error during API call:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.log("Deletion cancelled");
    }
  };

  // Handle Cancel button clicked show the last record for edit functionality
  const handleCancel = async () => {
    setIsEditing(false);
    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    setCancelButtonClicked(true);
    try {
      const response = await axios.get(
        `${API_URL}/get-lastdebitcreditnotedata?Company_Code=${companyCode}&Year_Code=${Year_Code}&tran_type=${tranType}`
      );
      if (response.status === 200) {
        const data = response.data;
        newDcid = data.last_head_data.dcid;
        BillFromName = data.last_details_data[0].BillFromName;
        BillFormCode = data.last_head_data.ac_code;
        ShipToName = data.last_details_data[0].UnitAcName;
        ShipToCode = data.last_head_data.Unit_Code;
        BillToName = data.last_details_data[0].ShipToName;
        BillToCode = data.last_head_data.Shit_To;
        GSTName = data.last_details_data[0].GST_Name;
        GSTCode = data.last_head_data.gst_code;
        MillName = data.last_details_data[0].MillName;
        MillCode = data.last_head_data.Mill_Code;
        ExpAcaccountName = data.last_details_data[0].expacaccountname;
        ExpAcaccountCode = data.last_details_data[0].expac_code;
        ItemCodeName = data.last_details_data[0].Item_Name;
        ItemCodeDetail = data.last_details_data[0].Item_Code;
        HSN = data.last_details_data[0].HSN;

        // setCgstRate(parseFloat(data.last_head_data.cgst_rate));
        // setSgstRate(parseFloat(data.last_head_data.sgst_rate));
        // setIgstRate(parseFloat(data.last_head_data.igst_rate));

        setFormData((prevData) => ({
          ...prevData,
          ...data.last_head_data,
          // cgst_rate: parseFloat(data.last_head_data.cgst_rate),
          // sgst_rate: parseFloat(data.last_head_data.sgst_rate),
          // igst_rate: parseFloat(data.last_head_data.igst_rate),
        }));

        setLastTenderData(data.last_head_data || {});
        setLastTenderDetails(data.last_details_data || []);
      } else {
        toast.error(
          "Failed to fetch last data:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      toast.error("Error during API call:", error);
    }
  };

  // Handle back to Utility page
  const handleBack = () => {
    navigate("/debitcreditnote-utility");
  };

  // Navigation Functionality to show first, previous, next, and last record functionality
  const handleFirstButtonClick = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/get-firstdebitcredit-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}&tran_type=${tranType}`
      );
      if (response.status === 200) {
        const data = response.data;
        newDcid = data.last_head_data.dcid;
        BillFromName = data.last_details_data[0].BillFromName;
        BillFormCode = data.last_head_data.ac_code;
        ShipToName = data.last_details_data[0].UnitAcName;
        ShipToCode = data.last_head_data.Unit_Code;
        BillToName = data.last_details_data[0].ShipToName;
        BillToCode = data.last_head_data.Shit_To;
        GSTName = data.last_details_data[0].GST_Name;
        GSTCode = data.last_head_data.gst_code;
        MillName = data.last_details_data[0].MillName;
        MillCode = data.last_head_data.Mill_Code;
        ExpAcaccountName = data.last_details_data[0].expacaccountname;
        ExpAcaccountCode = data.last_details_data[0].expac_code;
        ItemCodeName = data.last_details_data[0].Item_Name;
        ItemCodeDetail = data.last_details_data[0].Item_Code;
        setFormData((prevData) => ({
          ...prevData,
          ...data.last_head_data,
        }));
        setLastTenderData(data.last_head_data || {});
        setLastTenderDetails(data.last_details_data || []);
      } else {
        console.error(
          "Failed to fetch first tender data:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  // Function to fetch the last record
  const handleLastButtonClick = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/get-lastdebitcredit-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}&tran_type=${tranType}`
      );
      if (response.status === 200) {
        const data = response.data;
        newDcid = data.last_head_data.dcid;
        BillFromName = data.last_details_data[0].BillFromName;
        BillFormCode = data.last_head_data.ac_code;
        ShipToName = data.last_details_data[0].UnitAcName;
        ShipToCode = data.last_head_data.Unit_Code;
        BillToName = data.last_details_data[0].ShipToName;
        BillToCode = data.last_head_data.Shit_To;
        GSTName = data.last_details_data[0].GST_Name;
        GSTCode = data.last_head_data.gst_code;
        MillName = data.last_details_data[0].MillName;
        MillCode = data.last_head_data.Mill_Code;
        ExpAcaccountName = data.last_details_data[0].expacaccountname;
        ExpAcaccountCode = data.last_details_data[0].expac_code;
        ItemCodeName = data.last_details_data[0].Item_Name;
        ItemCodeDetail = data.last_details_data[0].Item_Code;
        setFormData((prevData) => ({
          ...prevData,
          ...data.last_head_data,
        }));
        setLastTenderData(data.last_head_data || {});
        setLastTenderDetails(data.last_details_data || []);
      } else {
        console.error(
          "Failed to fetch last tender data:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  // Function to fetch the next record
  const handleNextButtonClick = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/get-nextdebitcreditnote-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}&tran_type=${tranType}&doc_no=${formData.doc_no}`
      );
      if (response.status === 200) {
        const data = response.data;
        newDcid = data.last_head_data.dcid;
        BillFromName = data.last_details_data[0].BillFromName;
        BillFormCode = data.last_head_data.ac_code;
        ShipToName = data.last_details_data[0].UnitAcName;
        ShipToCode = data.last_head_data.Unit_Code;
        BillToName = data.last_details_data[0].ShipToName;
        BillToCode = data.last_head_data.Shit_To;
        GSTName = data.last_details_data[0].GST_Name;
        GSTCode = data.last_head_data.gst_code;
        MillName = data.last_details_data[0].MillName;
        MillCode = data.last_head_data.Mill_Code;
        ExpAcaccountName = data.last_details_data[0].expacaccountname;
        ExpAcaccountCode = data.last_details_data[0].expac_code;
        ItemCodeName = data.last_details_data[0].Item_Name;
        ItemCodeDetail = data.last_details_data[0].Item_Code;
        setFormData((prevData) => ({
          ...prevData,
          ...data.last_head_data,
        }));
        setLastTenderData(data.last_head_data || {});
        setLastTenderDetails(data.last_details_data || []);
      } else {
        console.error(
          "Failed to fetch next tender data:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  // Function to fetch the previous record
  const handlePreviousButtonClick = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/get-previousDebitcreditnote-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}&tran_type=${tranType}&doc_no=${formData.doc_no}`
      );
      if (response.status === 200) {
        const data = response.data;
        newDcid = data.last_head_data.dcid;
        BillFromName = data.last_details_data[0].BillFromName;
        BillFormCode = data.last_head_data.ac_code;
        ShipToName = data.last_details_data[0].UnitAcName;
        ShipToCode = data.last_head_data.Unit_Code;
        BillToName = data.last_details_data[0].ShipToName;
        BillToCode = data.last_head_data.Shit_To;
        GSTName = data.last_details_data[0].GST_Name;
        GSTCode = data.last_head_data.gst_code;
        MillName = data.last_details_data[0].MillName;
        MillCode = data.last_head_data.Mill_Code;
        ExpAcaccountName = data.last_details_data[0].expacaccountname;
        ExpAcaccountCode = data.last_details_data[0].expac_code;
        ItemCodeName = data.last_details_data[0].Item_Name;
        ItemCodeDetail = data.last_details_data[0].Item_Code;
        setFormData((prevData) => ({
          ...prevData,
          ...data.last_head_data,
        }));
        setLastTenderData(data.last_head_data || {});
        setLastTenderDetails(data.last_details_data || []);
      } else {
        console.error(
          "Failed to fetch previous tender data:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  // Handle form submission (you can modify this based on your needs)
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (selectedRecord) {
      handlerecordDoubleClicked();
    } else {
      handleAddOne();
    }
  }, [selectedRecord]);

  // After Record DoubleClicked on utility page show that record on User Creation for Edit Mode
  const handlerecordDoubleClicked = async () => {
    setIsEditing(false);
    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    setCancelButtonClicked(true);
    try {
      const response = await axios.get(
        `${API_URL}/getdebitcreditByid?doc_no=${selectedRecord.doc_no}&Company_Code=${companyCode}&Year_Code=${Year_Code}&tran_type=${selectedRecord.tran_type}`
      );
      if (response.status === 200) {
        const data = response.data;
        newDcid = data.last_head_data.dcid;
        BillFromName = data.last_details_data[0].BillFromName;
        BillFormCode = data.last_head_data.ac_code;
        ShipToName = data.last_details_data[0].UnitAcName;
        ShipToCode = data.last_head_data.Unit_Code;
        BillToName = data.last_details_data[0].ShipToName;
        BillToCode = data.last_head_data.Shit_To;
        GSTName = data.last_details_data[0].GST_Name;
        GSTCode = data.last_head_data.gst_code;
        MillName = data.last_details_data[0].MillName;
        MillCode = data.last_head_data.Mill_Code;
        ExpAcaccountName = data.last_details_data[0].expacaccountname;
        ExpAcaccountCode = data.last_details_data[0].expac_code;
        ItemCodeName = data.last_details_data[0].Item_Name;
        ItemCodeDetail = data.last_details_data[0].Item_Code;
        setFormData((prevData) => ({
          ...prevData,
          ...data.last_head_data,
        }));
        setTranType(selectedRecord.tran_type);
        setLastTenderData(data.last_head_data || {});
        setLastTenderDetails(data.last_details_data || []);
      } else {
        console.error(
          "Failed to fetch last tender data:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  // Change No functionality to get that particular record
  const handleKeyDown = async (event) => {
    if (event.key === "Tab") {
      const changeNoValue = event.target.value;
      try {
        const response = await axios.get(
          `${API_URL}/getdebitcreditByid?Company_Code=${companyCode}&doc_no=${changeNoValue}&tran_type=${tranType}&Year_Code=${Year_Code}`
        );
        const data = response.data;
        BillFromName = data.last_details_data[0].BillFromName;
        BillFormCode = data.last_head_data.ac_code;
        ShipToName = data.last_details_data[0].UnitAcName;
        ShipToCode = data.last_head_data.Unit_Code;
        BillToName = data.last_details_data[0].ShipToName;
        BillToCode = data.last_head_data.Shit_To;
        GSTName = data.last_details_data[0].GST_Name;
        GSTCode = data.last_head_data.gst_code;
        MillName = data.last_details_data[0].MillName;
        MillCode = data.last_head_data.Mill_Code;
        ExpAcaccountName = data.last_details_data[0].expacaccountname;
        ExpAcaccountCode = data.last_details_data[0].expac_code;
        ItemCodeName = data.last_details_data[0].Item_Name;
        ItemCodeDetail = data.last_details_data[0].Item_Code;
        setFormData({
          ...formData,
          ...data.last_head_data,
        });
        setLastTenderData(data.last_head_data || {});
        setLastTenderDetails(data.last_details_data || []);
        setIsEditing(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  // Detail Grid Functionality
  useEffect(() => {
    if (selectedRecord) {
      setUsers(
        lastTenderDetails.map((detail) => ({
          Item_Code: detail.Item_Code,
          rowaction: "Normal",
          expac_code: detail.expac_code,
          expacName: detail.expacName,
          expac: detail.expac,
          ic: detail.ic,
          itemName: itemName,
          id: detail.dcdetailid,
          dcdetailid: detail.dcdetailid,
          value: detail.value,
          HSN: hsnNo || detail.HSN,
          Quantal: detail.Quantal,
        }))
      );
    }
  }, [selectedRecord, lastTenderDetails]);

  useEffect(() => {
    const updatedUsers = lastTenderDetails.map((detail) => ({
      Item_Code: detail.Item_Code,
      rowaction: "Normal",
      expac_code: detail.expac_code,
      expacName: detail.expacaccountname,
      expac: detail.expac,
      ic: detail.ic,
      itemName: detail.Item_Name,
      id: detail.dcdetailid,
      dcdetailid: detail.dcdetailid,
      value: detail.value,
      HSN: detail.HSN,
      Quantal: detail.Quantal,
    }));

    setUsers(updatedUsers);
  }, [lastTenderDetails]);

  // Function to handle changes in the form fields
  const handleChangeDetail = (event) => {
    const { name, value } = event.target;
    setFormDataDetail({
      ...formDataDetail,
      [name]: value,
    });
  };

  // Open popup function
  const openPopup = (mode) => {
    setPopupMode(mode);
    setShowPopup(true);
    if (mode === "add") {
      clearForm();
    }
  };

  // Close popup function
  const closePopup = () => {
    setShowPopup(false);
    setSelectedUser({});
    clearForm();
  };

  const clearForm = () => {
    setFormDataDetail({
      value: "",
      Quantal: "",
    });
    setExpacCode("");
    setExpacName("");
    setItemCode("");
    setItemName("");
    setHSNNo("");
  };

  const editUser = (user) => {
    setSelectedUser(user);
    setExpacCode(user.expac_code);

    setExpacName(user.expacName);

    setItemCode(user.Item_Code);
    setItemName(user.itemName);
    setFormDataDetail({
      value: user.value || "",
      HSN: user.HSN || hsnNo,
      Quantal: user.Quantal || "",
    });
    openPopup("edit");
  };

  const addUser = async () => {
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1,
      expac_code: expacCode,
      expac: expacAccoid,
      ic: itemCodeAccoid,
      expacName: expacName,
      Item_Code: itemCode,
      itemName: itemName,
      HSN: hsnNo || formDataDetail.HSN,
      Quantal: formDataDetail.Quantal,
      value: parseFloat(formDataDetail.value) || 0,
      rowaction: "add",
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);

    const totalTaxableAmount = calculateTotalTaxableAmount(updatedUsers);
    let updatedFormData = { ...formData, texable_amount: totalTaxableAmount };

    const matchStatus = await checkMatchStatus(
      updatedFormData.ac_code,
      companyCode,
      Year_Code
    );

    // Calculate GST rate from existing rates if GstRate is not set
    let gstRate = GstRate;
    if (!gstRate || gstRate === 0) {
      const cgstRate = parseFloat(formData.cgst_rate) || 0;
      const sgstRate = parseFloat(formData.sgst_rate) || 0;
      const igstRate = parseFloat(formData.igst_rate) || 0;

      // Assume that if IGST is present, it should be used; otherwise, use CGST + SGST
      gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
    }

    updatedFormData = await calculateDependentValues(
      "gst_code",
      gstRate,
      updatedFormData,
      matchStatus,
      gstRate
    );

    setFormData(updatedFormData);
    closePopup();
  };

  // Update User On Grid
  const updateUser = async () => {
    const updatedUsers = users.map((user) => {
      if (user.id === selectedUser.id) {
        const updatedRowaction =
          user.rowaction === "Normal" ? "update" : user.rowaction;
        return {
          ...user,
          expac_code: expacCode,
          Item_Code: itemCode,
          itemName: itemName,
          expac: expacAccoid,
          expacName: expacName,
          value: parseFloat(formDataDetail.value) || 0,
          HSN: hsnNo || formDataDetail.HSN,
          Quantal: formDataDetail.Quantal,
          rowaction: updatedRowaction,
          ic: itemCodeAccoid
        };
      }
      return user;
    });

    setUsers(updatedUsers);

    // Update the total taxable amount
    const totalTaxableAmount = calculateTotalTaxableAmount(updatedUsers);
    let updatedFormData = { ...formData, texable_amount: totalTaxableAmount };

    const matchStatus = await checkMatchStatus(
      updatedFormData.ac_code,
      companyCode,
      Year_Code
    );

    let gstRate = GstRate;
    if (!gstRate || gstRate === 0) {
      const cgstRate = parseFloat(formData.cgst_rate) || 0;
      const sgstRate = parseFloat(formData.sgst_rate) || 0;
      const igstRate = parseFloat(formData.igst_rate) || 0;

      gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
    }

    updatedFormData = await calculateDependentValues(
      "gst_code",
      gstRate,
      updatedFormData,
      matchStatus,
      gstRate
    );

    setFormData(updatedFormData);
    closePopup();
  };

  // Delete User On Grid
  const deleteModeHandler = async (user) => {
    setDeleteMode(true);
    setSelectedUser(user);
    let updatedUsers;

    if (isEditMode && user.rowaction === "add") {
      updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, rowaction: "DNU" } : u
      );
    } else if (isEditMode) {
      updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, rowaction: "delete" } : u
      );
    } else {
      updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, rowaction: "DNU" } : u
      );
    }

    setUsers(updatedUsers);
    setSelectedUser({});

    const totalTaxableAmount = calculateTotalTaxableAmount(updatedUsers);
    let updatedFormData = { ...formData, texable_amount: totalTaxableAmount };

    const matchStatus = await checkMatchStatus(
      updatedFormData.ac_code,
      companyCode,
      Year_Code
    );

    let gstRate = GstRate;
    if (!gstRate || gstRate === 0) {
      const cgstRate = parseFloat(formData.cgst_rate) || 0;
      const sgstRate = parseFloat(formData.sgst_rate) || 0;
      const igstRate = parseFloat(formData.igst_rate) || 0;
      gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
    }

    updatedFormData = await calculateDependentValues(
      "gst_code",
      gstRate,
      updatedFormData,
      matchStatus,
      gstRate
    );

    setFormData(updatedFormData);
  };

  // Functionality After delete record undo deleted record
  const openDelete = async (user) => {
    setDeleteMode(true);
    setSelectedUser(user);

    let updatedUsers;
    if (isEditMode && user.rowaction === "delete") {
      updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, rowaction: "Normal" } : u
      );
    } else {
      updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, rowaction: "add" } : u
      );
    }

    setUsers(updatedUsers);
    setSelectedUser({});

    const totalTaxableAmount = calculateTotalTaxableAmount(updatedUsers);
    let updatedFormData = { ...formData, texable_amount: totalTaxableAmount };

    const matchStatus = await checkMatchStatus(
      updatedFormData.ac_code,
      companyCode,
      Year_Code
    );

    let gstRate = GstRate;
    if (!gstRate || gstRate === 0) {
      const cgstRate = parseFloat(formData.cgst_rate) || 0;
      const sgstRate = parseFloat(formData.sgst_rate) || 0;
      const igstRate = parseFloat(formData.igst_rate) || 0;

      gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
    }

    updatedFormData = await calculateDependentValues(
      "gst_code",
      gstRate,
      updatedFormData,
      matchStatus,
      gstRate
    );

    setFormData(updatedFormData);
  };

  // Functionality to help section to set the record
  const handleItemCode = (code, accoid, name, HSN) => {
    setItemCode(code);
    setItemCodeAccoid(accoid);
    setHSNNo(HSN);
    setItemName(name);
  };

  // Handle changes in the Mill_Code input (assuming SystemMasterHelp handles its own state
  const handleExpAcCode = (code, accoid, name) => {
    setExpacCode(code);
    setExpacAccoid(accoid);
    setExpacName(name);
    const updatedUsers = users.map((user) => {
      if (user.expac_code === code) {
        return {
          ...user,
          expac: accoid,
          expacName: name,
        };
      }
      return user;
    });
    setUsers(updatedUsers);
  };

  const checkMatchStatus = async (ac_code, company_code, year_code) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API}/get_match_status`,
        {
          params: {
            Ac_Code: ac_code,
            Company_Code: company_code,
            Year_Code: year_code,
          },
        }
      );
      return data.match_status;
    } catch (error) {
      console.error("Error checking GST State Code match.");

      return error;
    }
  };

  const handleBillNo = () => { };

  const handleBillTo = (code, accoid) => {
    setBillTo(code);
    setFormData({
      ...formData,
      Shit_To: code,
      st: accoid,
    });
  };

  const handleMillData = (code, accoid) => {
    setMill(code);
    setFormData({
      ...formData,
      Mill_Code: code,
      mc: accoid,
    });
  };

  const handleShipTo = (code, accoid) => {
    setShipTo(code);
    setFormData({
      ...formData,
      Unit_Code: code,
      uc: accoid,
    });
  };

  const handleBillFrom = async (code, accoid) => {
    setBillFrom(code);
    let updatedFormData = {
      ...formData,
      ac_code: code,
      ac: accoid,
    };

    try {
      const matchStatusResult = await checkMatchStatus(
        code,
        companyCode,
        Year_Code
      );
      setMatchStatus(matchStatusResult);

      if (matchStatusResult === "TRUE") {
        console.log("GST State Codes match!");
      } else {
        console.log("GST State Codes do not match.");
      }

      let gstRate = GstRate;

      if (!gstRate || gstRate === 0) {
        const cgstRate = parseFloat(formData.cgst_rate) || 0;
        const sgstRate = parseFloat(formData.sgst_rate) || 0;
        const igstRate = parseFloat(formData.igst_rate) || 0;

        gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
      }

      updatedFormData = await calculateDependentValues(
        "gst_code",
        GstRate,
        updatedFormData,
        matchStatusResult,
        gstRate
      );
      setFormData(updatedFormData);
    } catch (error) {
      console.log("Error in handleBillFrom:", error);
    }
  };
  const handleGstCode = async (code, Rate) => {
    setGstCode(code);
    let rate = parseFloat(Rate);
    setFormData({
      ...formData,
      gst_code: code,
    });
    setGstRate(rate);

    const updatedFormData = {
      ...formData,
      gst_code: code,
    };

    try {
      const matchStatusResult = await checkMatchStatus(
        updatedFormData.ac_code,
        companyCode,
        Year_Code
      );
      setMatchStatus(matchStatusResult);
      const newFormData = await calculateDependentValues(
        "gst_code",
        rate,
        updatedFormData,
        matchStatusResult,
        rate
      );

      setFormData(newFormData);
    } catch (error) { }
  };

  const calculateTotalTaxableAmount = (users) => {
    return users
      .filter((user) => user.rowaction !== "delete" && user.rowaction !== "DNU")
      .reduce((sum, user) => sum + parseFloat(user.value || 0), 0);
  };

  const calculateDependentValues = async (
    name,
    input,
    formData,
    matchStatus,
    gstRate
  ) => {
    const updatedFormData = { ...formData, [name]: input };
    const taxableAmount = parseFloat(updatedFormData.texable_amount) || 0.0;
    const rate = gstRate;

    if (matchStatus === "TRUE") {
      updatedFormData.cgst_rate = (rate / 2).toFixed(2);
      updatedFormData.sgst_rate = (rate / 2).toFixed(2);
      updatedFormData.igst_rate = 0.0;

      updatedFormData.cgst_amount = (
        (taxableAmount * updatedFormData.cgst_rate) /
        100
      ).toFixed(2);
      updatedFormData.sgst_amount = (
        (taxableAmount * updatedFormData.sgst_rate) /
        100
      ).toFixed(2);
      updatedFormData.igst_amount = 0.0;
    } else {
      updatedFormData.igst_rate = rate.toFixed(2);
      updatedFormData.cgst_rate = 0.0;
      updatedFormData.sgst_rate = 0.0;

      updatedFormData.igst_amount = (
        (taxableAmount * updatedFormData.igst_rate) /
        100
      ).toFixed(2);
      updatedFormData.cgst_amount = 0.0;
      updatedFormData.sgst_amount = 0.0;
    }

    const miscAmount = parseFloat(updatedFormData.misc_amount) || 0.0;
    updatedFormData.bill_amount = (
      taxableAmount +
      parseFloat(updatedFormData.cgst_amount) +
      parseFloat(updatedFormData.sgst_amount) +
      parseFloat(updatedFormData.igst_amount) +
      miscAmount
    ).toFixed(2);

    const tcsRate = parseFloat(updatedFormData.TCS_Rate) || 0.0;
    updatedFormData.TCS_Amt = (
      (updatedFormData.bill_amount * tcsRate) /
      100
    ).toFixed(2);
    updatedFormData.TCS_Net_Payable = (
      parseFloat(updatedFormData.bill_amount) +
      parseFloat(updatedFormData.TCS_Amt)
    ).toFixed(2);

    const tdsRate = parseFloat(updatedFormData.TDS_Rate) || 0.0;
    updatedFormData.TDS_Amt = (
      (updatedFormData.texable_amount * tdsRate) /
      100
    ).toFixed(2);

    return updatedFormData;
  };

  const validateNumericInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9.]/g, '');
  };

  return (
    <>
      <ToastContainer />
      <h3 className="mt-4 mb-4 text-center custom-heading">
        Debit Credit Note
      </h3>
      <div >
        <ActionButtonGroup
          handleAddOne={handleAddOne}
          addOneButtonEnabled={addOneButtonEnabled}
          handleSaveOrUpdate={handleSaveOrUpdate}
          saveButtonEnabled={saveButtonEnabled}
          isEditMode={isEditMode}
          handleEdit={handleEdit}
          editButtonEnabled={editButtonEnabled}
          handleDelete={handleDelete}
          deleteButtonEnabled={deleteButtonEnabled}
          handleCancel={handleCancel}
          cancelButtonEnabled={cancelButtonEnabled}
          handleBack={handleBack}
          backButtonEnabled={backButtonEnabled}
        />
        <div>
          <NavigationButtons
            handleFirstButtonClick={handleFirstButtonClick}
            handlePreviousButtonClick={handlePreviousButtonClick}
            handleNextButtonClick={handleNextButtonClick}
            handleLastButtonClick={handleLastButtonClick}
            highlightedButton={highlightedButton}
            isEditing={isEditing}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="debitCreditNote-form">
          <Grid container spacing={1}>
            <Grid item xs={12} sm={1}>
              <TextField
                label="Change No"
                name="changeNo"
                variant="outlined"
                fullWidth
                onKeyDown={handleKeyDown}
                disabled={!addOneButtonEnabled}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <TextField
                label="Entry No"
                name="doc_no"
                variant="outlined"
                fullWidth
                value={formData.doc_no}
                onChange={handleChange}
                disabled
                inputRef={setFocusTaskdate}
                size="small"
              />
            </Grid>
            <label htmlFor="tran_type" className="debitCreditNote-form-label" style={{ marginTop: "12px", marginLeft: '12px' }}>
              Type:
            </label>
            <Grid item xs={12} sm={2}>
              <select
                id="tran_type"
                name="tran_type"
                className="debitCreditNote-custom-select"
                value={formData.tran_type}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              >
                <option value="DN">Debit Note To Customer</option>
                <option value="CN">Credit Note To Customer</option>
                <option value="DS">Debit Note To Supplier</option>
                <option value="CS">Credit Note To Supplier</option>
              </select>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Entry Date"
                type="date"
                name="doc_date"
                variant="outlined"
                fullWidth
                value={formData.doc_date}
                onChange={(e) => handleDateChange(e, "doc_date")}
                disabled={!isEditing && addOneButtonEnabled}
                InputLabelProps={{
                  shrink: true,
                }}
                inputRef={setFocusTaskdate}
                size="small"
              />
            </Grid>
            <label htmlFor="Bill_From" className="debitCreditNote-form-label" style={{ marginTop: "12px", marginLeft: '20px' }}>
              Bill From:
            </label>
            <div >
              <div >
                <AccountMasterHelp
                  onAcCodeClick={handleBillFrom}
                  CategoryName={BillFromName}
                  CategoryCode={BillFormCode}
                  name="ac_code"
                  disabledFeild={!isEditing && addOneButtonEnabled}
                />
              </div>
            </div>
          </Grid>
        </div>
        <br></br>

        <div className="debitCreditNote-row">
          <label htmlFor="Bill_No" className="debitCreditNote-form-label" style={{ marginTop: "12px", marginLeft: '12px' }}>
            Bill No:
          </label>
          <div className="debitCreditNote-col">
            <div className="debitCreditNote-form-group">
              <AccountMasterHelp
                onAcCodeClick={handleBillNo}
                CategoryName=""
                CategoryCode=""
                name="Bill_No"
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label className="debitCreditNote-form-label">Bill Date:</label>
          <div className="debitCreditNote-col">
            <div className="debitCreditNote-form-group">
              <input
                type="date"
                className="debitCreditNote-form-control"
                id="datePicker"
                name="bill_date"
                value={formData.bill_date}
                onChange={(e) => handleDateChange(e, "bill_date")}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label htmlFor="Bill_To" className="debitCreditNote-form-label" style={{ marginTop: "10px", marginLeft: '12px' }}>
            Bill To:
          </label>
          <div className="debitCreditNote-col">
            <div className="debitCreditNote-form-group">
              <AccountMasterHelp
                onAcCodeClick={handleBillTo}
                CategoryName={BillToName}
                CategoryCode={BillToCode}
                name="Bill_To"
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label htmlFor="Mill" className="debitCreditNote-form-label" style={{ marginTop: "10px", marginLeft: '12px' }}>
            Mill:
          </label>
          <div className="debitCreditNote-col">
            <div className="debitCreditNote-form-group">
              <AccountMasterHelp
                onAcCodeClick={handleMillData}
                CategoryName={MillName}
                CategoryCode={MillCode}
                name="Mill"
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label htmlFor="Ship_To" className="debitCreditNote-form-label" style={{ marginTop: "10px", marginLeft: '12px' }}>
            Ship To:
          </label>
          <div className="debitCreditNote-col">
            <div className="debitCreditNote-form-group">
              <AccountMasterHelp
                onAcCodeClick={handleShipTo}
                CategoryName={ShipToName}
                CategoryCode={ShipToCode}
                name="Ship_To"
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
        </div>
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner-container">
              <HashLoader color="#007bff" loading={isLoading} size={80} />
            </div>
          </div>
        )}
        {/*detail part popup functionality and Validation part Grid view */}
        <div >
          <div style={{ float: "left", marginBottom: '5px' }}>
            <button
              className="btn btn-primary"
              onClick={() => openPopup("add")}
              disabled={!isEditing}
              onKeyDown={(event) => {
                if (event.key === 13) {
                  openPopup("add");
                }
              }}
            >
              Add
            </button>
            <button
              className="btn btn-danger"
              disabled={!isEditing}
              style={{ marginLeft: "10px" }}
            >
              Close
            </button>
          </div>
          {showPopup && (
            <div className="modal" role="dialog" style={{ display: "block" }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {selectedUser.id ? "Edit" : "Add"}
                    </h5>
                    <button
                      type="button"
                      onClick={closePopup}
                      aria-label="Close"
                      style={{
                        marginLeft: "80%",
                        width: "60px",
                        height: "30px",
                      }}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <form>
                      <label>Exp Ac Code:</label>
                      <div className="form-element">
                        <AccountMasterHelp
                          onAcCodeClick={handleExpAcCode}
                          CategoryName={expacName}
                          CategoryCode={expacCode}
                          name="expac_code"
                          className="account-master-help"
                        />
                      </div>

                      <label className="debitCreditNote-form-label">
                        Value:
                      </label>
                      <div className="debitCreditNote-col-Ewaybillno">
                        <div className="debitCreditNote-form-group">
                          <input
                            type="text"
                            className="debitCreditNote-form-control"
                            name="value"
                            autoComplete="off"
                            value={formDataDetail.value}
                            onChange={handleChangeDetail}
                          />
                        </div>
                      </div>

                      <label>Item Code:</label>
                      <div className="form-element">
                        <SystemHelpMaster
                          onAcCodeClick={handleItemCode}
                          CategoryName={itemName}
                          CategoryCode={itemCode}
                          name="Item_Code"
                          SystemType="I"
                          className="account-master-help"
                        />
                      </div>

                      <label className="debitCreditNote-form-label">HSN:</label>
                      <div className="debitCreditNote-col-Ewaybillno">
                        <div className="debitCreditNote-form-group">
                          <input
                            type="text"
                            className="debitCreditNote-form-control"
                            name="HSN"
                            autoComplete="off"
                            value={formDataDetail.HSN || hsnNo}
                            onChange={handleChangeDetail}
                          />
                        </div>
                      </div>
                      <label className="debitCreditNote-form-label">
                        Quantal:
                      </label>
                      <div className="debitCreditNote-col-Ewaybillno">
                        <div className="debitCreditNote-form-group">
                          <input
                            type="text"
                            className="debitCreditNote-form-control"
                            name="Quantal"
                            autoComplete="off"
                            value={formDataDetail.Quantal}
                            onChange={handleChangeDetail}
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="modal-footer">
                    {selectedUser.id ? (
                      <button
                        className="btn btn-primary"
                        onClick={updateUser}
                        onKeyDown={(event) => {
                          if (event.key === 13) {
                            updateUser();
                          }
                        }}
                      >
                        Update User
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={addUser}
                        onKeyDown={(event) => {
                          if (event.key === 13) {
                            addUser();
                          }
                        }}
                      >
                        Add User
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closePopup}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <table className="table mt-4 table-bordered">
            <thead>
              <tr>
                <th>Actions</th>
                <th>Rowaction</th>
                <th>ID</th>
                <th>Expac Code</th>
                <th>Expac name</th>
                <th>item Code</th>
                <th>item Name</th>
                <th>Value</th>
                <th>HSN</th>
                <th>Quantal</th>
                <th>dcdetailid</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    {user.rowaction === "add" ||
                      user.rowaction === "update" ||
                      user.rowaction === "Normal" ? (
                      <>
                        <button
                          className="btn btn-warning"
                          onClick={() => editUser(user)}
                          disabled={!isEditing}
                          onKeyDown={(event) => {
                            if (event.key === 13) {
                              editUser(user);
                            }
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger ms-2"
                          onClick={() => deleteModeHandler(user)}
                          onKeyDown={(event) => {
                            if (event.key === 13) {
                              deleteModeHandler(user);
                            }
                          }}
                          disabled={!isEditing}
                        >
                          Delete
                        </button>
                      </>
                    ) : user.rowaction === "DNU" ||
                      user.rowaction === "delete" ? (
                      <button
                        className="btn btn-secondary"
                        onClick={() => openDelete(user)}
                      >
                        Open
                      </button>
                    ) : null}
                  </td>
                  <td>{user.rowaction}</td>
                  <td>{user.id}</td>
                  <td>{user.expac_code}</td>
                  <td>{user.expacName}</td>
                  <td>{user.Item_Code}</td>
                  <td>{user.itemName}</td>
                  <td>{user.value}</td>
                  <td>{user.HSN}</td>
                  <td>{user.Quantal}</td>
                  <td>{user.dcdetailid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        <div className="debitCreditNote-row">
          <label htmlFor="gst_code" >
            GST Rate Code:
          </label>
          <div className="debitCreditNote-col">
            <div className="debitCreditNote-form-group">
              <GSTRateMasterHelp
                onAcCodeClick={handleGstCode}
                GstRateName={GSTName}
                GstRateCode={GSTCode}
                name="gst_code"
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
              <Grid container spacing={1}>
                <Grid item xs={12} sm={3} ml={2}>
                  <TextField
                    label="ASN No"
                    name="ASNNO"
                    variant="outlined"
                    fullWidth
                    value={formData.ASNNO}
                    onChange={handleChange}
                    disabled={!isEditing && addOneButtonEnabled}
                    autoComplete="off"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={3} ml={2}>
                  <TextField
                    label="EInvoice No"
                    name="Ewaybillno"
                    variant="outlined"
                    fullWidth
                    value={formData.Ewaybillno}
                    onChange={handleChange}
                    disabled={!isEditing && addOneButtonEnabled}
                    autoComplete="off"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    label="ACK No"
                    name="ackno"
                    variant="outlined"
                    fullWidth
                    value={formData.ackno}
                    onChange={handleChange}
                    disabled={!isEditing && addOneButtonEnabled}
                    autoComplete="off"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <TextField
                    label="Narration"
                    name="Narration"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={formData.Narration}
                    onChange={handleChange}
                    autoComplete="off"
                    size="small"
                    disabled={!isEditing && addOneButtonEnabled}
                  />
                </Grid>
              </Grid>
            </div>
          </div>
        </div>

        <div className="debitcredit-taxation" >
          <Grid container spacing={1} alignItems="center" style={{ float: "right" }}>
            <Grid item xs={1}>
              <label className="debitCreditNote-form-label">Taxable Amount:</label>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                type="text"
                variant="outlined"
                fullWidth
                name="texable_amount"
                autoComplete="off"
                value={formData.texable_amount}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
                error={Boolean(formErrors.texable_amount)}
                helperText={formErrors.texable_amount}
                size="small"
                inputProps={{
                  sx: { textAlign: 'right' },
                  inputMode: 'decimal',
                  pattern: '[0-9]*[.,]?[0-9]+',
                  onInput: validateNumericInput,
                }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }} >
            <Grid item xs={1}>
              <label className="debitCreditNote-form-label">CGST:</label>
            </Grid>
            <Grid item xs={12} sm={1}>
              <TextField
                type="text"
                variant="outlined"
                fullWidth
                name="cgst_rate"
                autoComplete="off"
                value={formData.cgst_rate}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
                error={Boolean(formErrors.cgst_rate)}
                helperText={formErrors.cgst_rate}
                size="small"
                inputProps={{
                  sx: { textAlign: 'right' },
                  inputMode: 'decimal',
                  pattern: '[0-9]*[.,]?[0-9]+',
                  onInput: validateNumericInput,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <TextField
                type="text"
                variant="outlined"
                fullWidth
                name="cgst_amount"
                autoComplete="off"
                value={formData.cgst_amount}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
                error={Boolean(formErrors.cgst_amount)}
                helperText={formErrors.cgst_amount}
                size="small"
                inputProps={{
                  sx: { textAlign: 'right' },
                  inputMode: 'decimal',
                  pattern: '[0-9]*[.,]?[0-9]+',
                  onInput: validateNumericInput,
                }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }}>
            <Grid item xs={1}>
              <label className="debitCreditNote-form-label">SGST:</label>
            </Grid>
            <Grid item xs={12} sm={1}>
              <TextField
                type="text"
                variant="outlined"
                fullWidth
                name="sgst_rate"
                autoComplete="off"
                value={formData.sgst_rate}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
                error={Boolean(formErrors.sgst_rate)}
                helperText={formErrors.sgst_rate}
                size="small"
                inputProps={{
                  sx: { textAlign: 'right' },
                  inputMode: 'decimal',
                  pattern: '[0-9]*[.,]?[0-9]+',
                  onInput: validateNumericInput,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <TextField
                type="text"
                variant="outlined"
                fullWidth
                name="sgst_amount"
                autoComplete="off"
                value={formData.sgst_amount}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
                error={Boolean(formErrors.sgst_amount)}
                helperText={formErrors.sgst_amount}
                size="small"
                inputProps={{
                  sx: { textAlign: 'right' },
                  inputMode: 'decimal',
                  pattern: '[0-9]*[.,]?[0-9]+',
                  onInput: validateNumericInput,
                }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }}>
            <Grid item xs={1}>
              <label className="debitCreditNote-form-label">IGST:</label>
            </Grid>
            <Grid item xs={12} sm={1}>
              <TextField
                type="text"
                variant="outlined"
                fullWidth
                name="igst_rate"
                autoComplete="off"
                value={formData.igst_rate}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
                error={Boolean(formErrors.igst_rate)}
                helperText={formErrors.igst_rate}
                size="small"
                inputProps={{
                  sx: { textAlign: 'right' },
                  inputMode: 'decimal',
                  pattern: '[0-9]*[.,]?[0-9]+',
                  onInput: validateNumericInput,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <TextField
                type="text"
                variant="outlined"
                fullWidth
                name="igst_amount"
                autoComplete="off"
                value={formData.igst_amount}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
                error={Boolean(formErrors.igst_amount)}
                helperText={formErrors.igst_amount}
                size="small"
                inputProps={{
                  sx: { textAlign: 'right' },
                  inputMode: 'decimal',
                  pattern: '[0-9]*[.,]?[0-9]+',
                  onInput: validateNumericInput,
                }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }}>
            <Grid item xs={1}>
              <label className="debitCreditNote-form-label">MISC:</label>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                type="text"
                variant="outlined"
                fullWidth
                name="misc_amount"
                autoComplete="off"
                value={formData.misc_amount}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
                error={Boolean(formErrors.misc_amount)}
                helperText={formErrors.misc_amount}
                size="small"
                inputProps={{
                  sx: { textAlign: 'right' },
                  inputMode: 'decimal',
                  pattern: '[0-9]*[.,]?[0-9]+',
                  onInput: validateNumericInput,
                }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }}>
            <Grid item xs={1}>
              <label className="debitCreditNote-form-label">Final Amount:</label>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                type="text"
                variant="outlined"
                fullWidth
                name="bill_amount"
                autoComplete="off"
                value={formData.bill_amount}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
                error={Boolean(formErrors.bill_amount)}
                helperText={formErrors.bill_amount}
                size="small"
                inputProps={{
                  sx: { textAlign: 'right' },
                  inputMode: 'decimal',
                  pattern: '[0-9]*[.,]?[0-9]+',
                  onInput: validateNumericInput,
                }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }}>
            <Grid item xs={1}>
              <label className="debitCreditNote-form-label">TCS %:</label>
            </Grid>
            <Grid item xs={12} sm={1}>
              <TextField
                type="text"
                variant="outlined"
                fullWidth
                name="TCS_Rate"
                autoComplete="off"
                value={formData.TCS_Rate}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
                error={Boolean(formErrors.TCS_Rate)}
                helperText={formErrors.TCS_Rate}
                size="small"
                inputProps={{
                  sx: { textAlign: 'right' },
                  inputMode: 'decimal',
                  pattern: '[0-9]*[.,]?[0-9]+',
                  onInput: validateNumericInput,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <TextField
                type="text"
                variant="outlined"
                fullWidth
                name="TCS_Amt"
                autoComplete="off"
                value={formData.TCS_Amt}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
                error={Boolean(formErrors.TCS_Amt)}
                helperText={formErrors.TCS_Amt}
                size="small"
                inputProps={{
                  sx: { textAlign: 'right' },
                  inputMode: 'decimal',
                  pattern: '[0-9]*[.,]?[0-9]+',
                  onInput: validateNumericInput,
                }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }}>
            <Grid item xs={1}>
              <label className="debitCreditNote-form-label">Net Payable:</label>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                type="text"
                variant="outlined"
                fullWidth
                name="TCS_Net_Payable"
                autoComplete="off"
                value={formData.TCS_Net_Payable}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
                error={Boolean(formErrors.TCS_Net_Payable)}
                helperText={formErrors.TCS_Net_Payable}
                size="small"
                inputProps={{
                  sx: { textAlign: 'right' },
                  inputMode: 'decimal',
                  pattern: '[0-9]*[.,]?[0-9]+',
                  onInput: validateNumericInput,
                }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }}>
            <Grid item xs={1}>
              <label className="debitCreditNote-form-label">TDS %:</label>
            </Grid>
            <Grid item xs={12} sm={1}>
              <TextField
                type="text"
                variant="outlined"
                fullWidth
                name="TDS_Rate"
                autoComplete="off"
                value={formData.TDS_Rate}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
                error={Boolean(formErrors.TDS_Rate)}
                helperText={formErrors.TDS_Rate}
                size="small"
                inputProps={{
                  sx: { textAlign: 'right' },
                  inputMode: 'decimal',
                  pattern: '[0-9]*[.,]?[0-9]+',
                  onInput: validateNumericInput,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <TextField
                type="text"
                variant="outlined"
                fullWidth
                name="TDS_Amt"
                autoComplete="off"
                value={formData.TDS_Amt || ""}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
                error={Boolean(formErrors.TDS_Amt)}
                helperText={formErrors.TDS_Amt}
                size="small"
                inputProps={{
                  sx: { textAlign: 'right' },
                  inputMode: 'decimal',
                  pattern: '[0-9]*[.,]?[0-9]+',
                  onInput: validateNumericInput,
                }}
              />
            </Grid>
          </Grid>
        </div>
      </form>
    </>
  );
};
export default DebitCreditNote;
