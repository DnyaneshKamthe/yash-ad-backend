const multer = require("multer");
const clientInfo = require("../models/clientInfo");
const Customers = require("../models/customer");
const Documents = require("../models/documents");
const PlantDetails = require("../models/plantsDetails");
const LiasoningDetails = require("../models/liasoningDetails");
const CommercialDetails = require("../models/commercial");
const CommercialtotalDetails = require("../models/commercialTotal");
const Payment = require("../models/Payment");
const Commercial = require("../models/commercial");
const mongoose = require("mongoose");

// get data functons
const getAllDocuments = async (documentId)=>{
  console.log(documentId);
  try {
    const clientDocuments= await Documents.find({ _id : documentId});
    console.log(clientDocuments);
    return clientDocuments;
  
  } catch (error) {
    return error
  }
}

const getPlantDetails = async (plantId) => {
  console.log(plantId);
  try {
    const plantDetails= await PlantDetails.find({ _id : plantId});
    console.log(plantDetails);
    return plantDetails;
  
  } catch (error) {
    return error
  }
}

const getLiasoningDetails = async (liasoningId) => {
  console.log(liasoningId);
  try {
    const liasoningDetails= await LiasoningDetails.find({ _id : liasoningId});
    console.log(liasoningDetails);
    return liasoningDetails;
  
  } catch (error) {
    return error
  }
}

const getCommercialDetails = async (commercialSchemaId, commercialSchemaTotalId) => {
  console.log(commercialSchemaId,commercialSchemaTotalId);
  try {
    const commercialDetails= await CommercialDetails.find({ _id : commercialSchemaId});
    const commercialTotalDetais = await CommercialtotalDetails.find({ _id : commercialSchemaTotalId});
    console.log(commercialDetails,commercialTotalDetais);
    return [commercialDetails,commercialTotalDetais];
  
  } catch (error) {
    return error
  }
}

const getPaymentDetails = async (paymentId) =>{
  console.log(paymentId);
  try {
    const paymentDetails= await Payment.find({ _id : paymentId});
    console.log(paymentDetails);
    return paymentDetails;
  
  } catch (error) {
    return error
  }
}
const setClientInfo = async (req, res) => {
  console.log("14", req.body);
  try {
    const {
      clientName,
      category,
      contactPersonName,
      emailID,
      billingAdd,
      gstNumber,
      billingUnitNumber,
      consumerNumber,
      clientBookBy,
      deliveryAdd,
      contactNumber,
      contactPersonNameInst,
      transportationDetails,
      anyAddRemark,
    } = req.body;

    // to add client or company details and object of all of the details
    const newclientInfo = new clientInfo({
      clientName,
      category,
      contactPersonName,
      emailID,
      billingAdd,
      gstNumber,
      billingUnitNumber,
      consumerNumber,
      clientBookBy,
      deliveryAdd,
      contactNumber,
      contactPersonNameInst,
      transportationDetails,
      anyAddRemark,
    });
    console.log(newclientInfo);
    await newclientInfo.save();

    const customer = await Customers.findOneAndUpdate({ number: contactNumber }, { $set: { status: "workOrder" } });

    res.status(200).json({
      status: 200,
      message: "Order details added successfully",
      newclientInfo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, error: "Internal Server Error" });
  }
};


const saveDocuments = async (req, res) => {
  const client_id = req.params.client_id;
  console.log(client_id);
  try {
    // Check if the clientInfo already exists for the given client_id
    let existingClientInfo = await clientInfo.findOne({ _id: client_id });
    console.log(existingClientInfo,"line 84")

    if (!existingClientInfo) {
      // If clientInfo doesn't exist, return an error
      return res.status(404).json({
        status: 404,
        error: "ClientInfo not found for the given client_id",
      });
    }
    console.log("line 92")
    console.log("line 93",req.files)
    // Update the fields with the new file names
    // existingClientInfo.photo = req.files["photo"]
    //   ? req.files["photo"][0].filename
    //   : existingClientInfo.photo;
    // existingClientInfo.adharcard = req.files["adharcard"]
    //   ? req.files["adharcard"][0].filename
    //   : existingClientInfo.adharcard;
    // existingClientInfo.pancard = req.files["pancard"]
    //   ? req.files["pancard"][0].filename
    //   : existingClientInfo.pancard;
    // existingClientInfo.electricitybill = req.files["electricitybill"]
    //   ? req.files["electricitybill"][0].filename
    //   : existingClientInfo.electricitybill;
    // existingClientInfo.taxreceipt = req.files["taxreceipt"]
    //   ? req.files["taxreceipt"][0].filename
    //   : existingClientInfo.taxreceipt;
    // existingClientInfo.powerofattorney = req.files["powerofattorney"]
    //   ? req.files["powerofattorney"][0].filename
    //   : existingClientInfo.powerofattorney;
    // existingClientInfo.annexure2 = req.files["annexure2"]
    //   ? req.files["annexure2"][0].filename
    //   : existingClientInfo.annexure2;
    // existingClientInfo.applicationform = req.files["applicationform"]
    //   ? req.files["applicationform"][0].filename
    //   : existingClientInfo.applicationform;

    // Save documents in the Documents schema
    const newDocuments = new Documents({
      photo: req.files["photo"][0].filename,
      adharcard: req.files["adharcard"][0].filename,
      pancard: req.files["pancard"][0].filename,
      electricitybill: req.files["electricitybill"][0].filename,
      taxreceipt: req.files["taxreceipt"][0].filename,
      powerofattorney: req.files["powerofattorney"][0].filename,
      annexure2: req.files["annexure2"][0].filename,
      applicationform: req.files["applicationform"][0].filename,
    });
    const savedDocuments = await newDocuments.save();
    console.log(savedDocuments);
    // Update the client's documents in the database
    existingClientInfo.documents_Id = savedDocuments._id;
    await existingClientInfo.save();

    res.status(200).json({
      status: 200,
      message: "Documents Saved successfully",
      newclientInfo: existingClientInfo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, error: "Internal Server Error" });
  }
};

const getDocuments = async (req, res) => {
  try {
    const allClientInfo = await clientInfo.find({}).populate([
      { path: "documents_Id", model: "Documents" },
      { path: "PlantDetails_Id", model: "plantDetails" },
      { path: "LiasoningDetails_Id", model: "liasoningDetails" },
      { path: "CommercialSchema_Id", model: "commercialSchema" },
      { path: "CommercialtotalSchema_Id", model: "commercialTotalSchema" },
      { path: "Payment_Id", model: "paymentSchema" },
      // Add more fields to populate as needed
    ]);

    res.json({ allClientInfo });
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching data from the database");
  }
};

/******************************************************
 * @POST_PlantDetails
 * @route http://localhost:5000/api/setPlantDetails
 * @description use to post Plant details
 * @parameters
 * @returns success message Plant details added
 ******************************************************/
const setPlantDetails = async (req, res) => {
  try {
    const {
      panelMake,
      panelRemark,
      inverterMake,
      inverterRemark,
      structureHeight,
      structureRemarks,
      meterHeight,
      meterRemark,
      subsidy,
    } = req.body;
    console.log(req.body, "plant details");
    const { client_id } = req.params;
    let existingClient = await clientInfo.findOne({ _id: client_id });

    if (!existingClient) {
      return res.status(404).json({
        status: 404,
        error: "Client not found for the given client_id",
      });
    }

    const newPlantDetails = new PlantDetails({
      panelMake,
      panelRemarks:panelRemark,
      inverterMake,
      inverterRemarks:inverterRemark,
      structureHeight,
      structureRemark:structureRemarks,
      meterHeight,
      meterRemark,
      subsidy,
    });
    await newPlantDetails.save();
    console.log(newPlantDetails);

    existingClient.PlantDetails_Id = newPlantDetails._id;
    console.log(existingClient);
    await existingClient.save();

    res.status(200).json({
      success: true,
      status: 200,
      message: `Plant Details saved successfully`,
      // Include relevant data in the response
      updatedClientInfo: existingClient,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
};

/******************************************************
 * @POST_LiasoningDetails
 * @route http://localhost:5000/api/setLiasoningDetails
 * @description use to post Liasoning details
 * @parameters
 * @returns success message liasonong details added
 ******************************************************/
const setLiasoningDetails = async (req, res) => {
  try {
    // Extracting clientId from params
    const { client_id } = req.params;
    console.log(client_id);
    // Checking if the user exists in the database
    let existingClient = await clientInfo.findOne({ _id: client_id });

    if (!existingClient) {
      return res.status(404).json({
        status: 404,
        error: "Client not found for the given client_id",
      });
    }

    // Collecting data from the frontend
    const {
      changeOfName,
      existingName,
      newName,
      changeOfLoadExtension,
      existingLoad,
      newLoad,
      changeInMeter,
      existingMeterType,
      newMeterType,
    } = req.body;

    // Saving data in the liasoning schema
    const liasoningDetails = await LiasoningDetails.create({
      changeOfName,
      existingName,
      newName,
      changeOfLoadExtension,
      existingLoad,
      newLoad,
      changeInMeter,
      existingMeterType,
      newMeterType,
    });

    await liasoningDetails.save();
    // Updating the clientInfo schema with liasoningDetails ID
    existingClient.LiasoningDetails_Id = liasoningDetails._id;
    await existingClient.save();

    // Sending success response to the frontend
    res.status(200).json({
      success: true,
      status: 200,
      message: "Liasoning details saved successfully",
      liasoningDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: `Error: ${err.message}`,
    });
  }
};

/******************************************************
 * @POST_CommerDetails
 * @route http://localhost:5000/api/setCommerDetails
 * @description use to post Commer details
 * @parameters
 * @returns success message Commer details added
 ******************************************************/
const addCommercialDetails = async (req, res) => {
  try {
    // Extracting clientId from params
    const { client_id } = req.params;
    console.log(client_id, req.body.products);
    // Checking if the user exists in the database
    let existingClient = await clientInfo.findOne({ _id: client_id });

    if (!existingClient) {
      return res.status(404).json({
        status: 404,
        error: "Client not found for the given client_id",
      });
    }
    // Collecting data from the frontend
    let details = req.body.products;
    console.log("497", details);
    const productDetailsArray = req.body.products.map(
      (item) => item.productDetails
    );

    const { billAmount, meterCharges, otherCharges } = req.body;
    console.log(req.body.billAmount);
    // Calculate GST and total cost
    const gstBillAmount = Math.floor(billAmount + (billAmount * 13.8) / 100);
    const gstMeterCharges = Math.floor(
      meterCharges + (meterCharges * 13.8) / 100
    );
    const totalCost = Math.floor(gstBillAmount + gstMeterCharges);

    console.log("line 516");
    const commercial = new CommercialDetails({
      productDetails: productDetailsArray,
    });

    // Create an instance of CommercialTotalSchema
    const commercialTotal = new CommercialtotalDetails({
      billAmt: gstBillAmount.toString(), // Assuming your schema expects a string
      meterCharges: gstMeterCharges.toString(),
      otherCharges: otherCharges,
      totalCost: totalCost.toString(),
    });

    // Save CommercialDetails to the database
    await commercial.save();

    // Save CommercialTotalSchema to the database
    await commercialTotal.save();

    existingClient.CommercialSchema_Id = commercial._id;
    existingClient.CommercialtotalSchema_Id = commercialTotal._id;
    await existingClient.save();

    // Sending success response to the frontend
    res.status(200).json({
      success: true,
      status: 200,
      message: "Commercial details saved successfully",
      commercialDetails: commercial,
      commercialTotalDetails: commercialTotal,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: `Error`,
    });
  }
};

const addPaymentDetails = async (req, res) => {
  try {
    // Extracting clientId from params
    const { client_id } = req.params;
    const { installment, paymentDate, paymentMode, projectCost } = req.body;

    // Checking if the user exists in the database
    let existingClient = await clientInfo.findOne({ _id: client_id });

    if (!existingClient) {
      return res.status(404).json({
        status: 404,
        error: "Client not found for the given client_id",
      });
    }

    // Create a new document for each payment
    const newPayment = new Payment({
      installment: installment,
      paymentDate: paymentDate,
      paymentMode: paymentMode,
      projectCost: projectCost,
    });

    await newPayment.save();

    // Add the new payment ID to the array in existingClient
    existingClient.Payment_Id.push(newPayment._id);
    await existingClient.save();

    // Sending success response to the frontend
    res.status(200).json({
      success: true,
      status: 200,
      message: "Payment details saved successfully",
      paymentDetails: newPayment,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Error",
    });
  }
};

// get all work orders
const get_all_work_orders = async (req, res) => {
  const userId = req.user._id;
  let allOrders;
  try {
    // if (req.user.employeeRole === "Admin") {
    // allCustomers = await Customers.find();
    allOrders = await clientInfo.find();
    res.status(200).json({ orders: allOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const get_client_work_details = async (req, res) => {
  const customerId = req.params.customerId;
  const userId = req.user._id;
  try {
    const getCustomer = await Customers.find({_id: customerId })
    const getWorkOrder = await clientInfo.find({ contactNumber: getCustomer[0].number });
    // console.log("line 451 document id",getWorkOrder[0]);
    const allDocuments = await getAllDocuments(getWorkOrder[0].documents_Id);
    const plantDetails = await getPlantDetails(getWorkOrder[0].PlantDetails_Id);
    const liasoningDetails = await getLiasoningDetails(getWorkOrder[0].LiasoningDetails_Id);
    const commercialDetails = await getCommercialDetails(
      getWorkOrder[0].CommercialSchema_Id,
      getWorkOrder[0].CommercialtotalSchema_Id
    );
    const paymentsDetails = await getPaymentDetails(getWorkOrder[0].Payment_Id);

    const allOrderData = {
      clientInfo : getWorkOrder,
      documents : allDocuments,
      plantDetails : plantDetails,
      liasoningDetails:liasoningDetails,
      commercialDetails:commercialDetails,
      paymentsDetails:paymentsDetails
    }
    res.status(200).json({message:"data fetched successfully", orders  : allOrderData, status : 200})
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error-fetching client workorder info" });
  }
};

module.exports = {
  setClientInfo,
  saveDocuments,
  getDocuments,
  setPlantDetails,
  setLiasoningDetails,
  addCommercialDetails,
  addPaymentDetails,
  get_all_work_orders,
  get_client_work_details
};
