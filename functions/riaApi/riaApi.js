const express = require("express");
const cors = require("cors");
const http = require("http");
const fetch = require("node-fetch");
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.get("/getIp", (req, res) => {
  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress;
  console.log("Client IP:", ip);
  res.send({ clientIp: ip });
});
app.get("/getServerIp", async (req, res) => {
  var ipA = "";
  http.get({ host: "api.ipify.org", port: 80, path: "/" }, function (resp) {
    resp.on("data", function (ip) {
      console.log("My public IP address is: " + ip);
      ipA = ip;
      res.send(ipA);
    });
  });
});
const agentInfo = {
  AgentId: "RAHYD0300106",
  TerminalId: "RAHYD030010601",
  UserName: "Trip01",
  AppType: "API",
  Version: "V1.0",
};

app.post("/ria-login", async (req, res) => {
  try {
    const response = await fetch(
      "http://testrws.mywebcheck.in/travelapi.svc/Login",
      {
        method: "POST",
        headers: {
          Authorization: `Basic UkFIWUQwMzAwMTA2MDEqVHJpcDAxOlJpeWFAMTIz`,
          "Content-Type": "application/json",
        },
      }
    );

    // Check if the response is ok (status 200)
    if (!response.ok) {
      // Forward an error message to the client if the request was unsuccessful
      return res.status(400).json({
        message: "Error fetching data from the API",
        details: response,
      });
    }

    // Parse the response JSON
    const data = await response.json();
    console.log(data);
    // Send the response data to the client
    return res.status(200).json(data);
  } catch (error) {
    // If an error occurs (e.g., network issue), handle it
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.post("/availability", async (req, res) => {
  const {
    date,
    departure,
    arrival,
    direct,
    adults,
    child,
    infant,
    triptype,
    returnDate,
  } = req.body;

  // Validate that all required fields are provided (basic example of validation)
  if (!date || !departure || !arrival || !adults || !triptype) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const token =
    "VWlQY2g4OUJJR1M2MFcrLWpwcTYvQm8zZ3dKb3NLWWdiazZuMjhrNW5nS3BJWEQ1N2o3WHFIWjhzQXUzbmdZQmRtVFBzOW9STW9VSWVGb09zTWU1cU5iUnAycGhkSDlEMjlNbkdGZVI3TTdSUEdkend6WThEcmNDVnNlZjlYdnMzaXVmVXI4RWs3M2NZalVsSmZUUGxUaWR4eistdTdhc3llbGtaV1hVMlV6OEhqM1plRkV6NmJUQXIxL3RvR2t1Y3ZmNG82Tk4rLVphVUJ4bVh4YmVLNWNPdytBRDBBUFEt";

  // The body data (this should ideally be passed via req.body or be static as in your example)
  const availabilityInfo =
    triptype === "oneway"
      ? [
          {
            DepartureStation: departure,
            ArrivalStation: arrival,
            FlightDate: date,
            FarecabinOption: "E",
            FareType: "N",
            OnlyDirectFlight: direct ? true : false,
          },
        ]
      : [
          {
            DepartureStation: departure,
            ArrivalStation: arrival,
            FlightDate: date,
            FarecabinOption: "E",
            FareType: "N",
            OnlyDirectFlight: direct ? true : false,
          },
          {
            DepartureStation: arrival,
            ArrivalStation: departure,
            FlightDate: returnDate,
            FarecabinOption: "E",
            FareType: "N",
            OnlyDirectFlight: direct ? true : false,
          },
        ];
  const requestData = {
    TripType: triptype === "oneway" ? "O" : "R",
    AirlineID: "",
    AgentInfo: agentInfo,
    AvailInfo: availabilityInfo,
    PassengersInfo: {
      AdultCount: adults,
      ChildCount: child ? child : "0",
      InfantCount: infant ? infant : "0",
    },
  };

  try {
    // Send the POST request to the Availability API
    const response = await fetch(
      "http://testrws.mywebcheck.in/TravelAPI.svc/Availability",
      {
        method: "POST",
        headers: {
          TOKEN: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData), // Send the request body as JSON
      }
    );

    // Check if the response was successful
    if (!response.ok) {
      return res.status(400).json({
        message: "Error with Availability API",
        details: response.statusText,
      });
    }

    // Parse the response JSON
    const data = await response.json();
    console.log("flight responce", data);
    // Send the data back to the client
    return res.status(200).json(data);
  } catch (error) {
    // Catch any errors and send an error response
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.post("/fare-rules", async (req, res) => {
  const { flightId, trackId } = req.body;

  // Validate that all required fields are provided (basic example of validation)
  if (!flightId || !trackId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const token =
    "VWlQY2g4OUJJR1M2MFcrLWpwcTYvQm8zZ3dKb3NLWWdiazZuMjhrNW5nS3BJWEQ1N2o3WHFIWjhzQXUzbmdZQmRtVFBzOW9STW9VSWVGb09zTWU1cU5iUnAycGhkSDlEMjlNbkdGZVI3TTdSUEdkend6WThEcmNDVnNlZjlYdnMzaXVmVXI4RWs3M2NZalVsSmZUUGxUaWR4eistdTdhc3llbGtaV1hVMlV6OEhqM1plRkV6NmJUQXIxL3RvR2t1Y3ZmNG82Tk4rLVphVUJ4bVh4YmVLNWNPdytBRDBBUFEt";

  // The body data (this should ideally be passed via req.body or be static as in your example)
  const requestData = {
    AgentInfo: agentInfo,
    FlightsInfo: [
      {
        FlightID: flightId,
      },
    ],
    Trackid: trackId,
  };

  try {
    // Send the POST request to the Availability API
    const response = await fetch(
      "http://testrws.mywebcheck.in/TravelAPI.svc/GetFareRule",
      {
        method: "POST",
        headers: {
          TOKEN: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData), // Send the request body as JSON
      }
    );

    // Check if the response was successful
    if (!response.ok) {
      return res.status(400).json({
        message: "Error with Availability API",
        details: response.statusText,
      });
    }

    // Parse the response JSON
    const data = await response.json();
    console.log("fare rule responce", data);
    // Send the data back to the client
    return res.status(200).json(data);
  } catch (error) {
    // Catch any errors and send an error response
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});
app.post("/pricing", async (req, res) => {
  const { segmentInfo, itenaryInfo, trackId } = req.body;

  // Validate that all required fields are provided (basic example of validation)
  if (!segmentInfo || !trackId || !itenaryInfo) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const token =
    "VWlQY2g4OUJJR1M2MFcrLWpwcTYvQm8zZ3dKb3NLWWdiazZuMjhrNW5nS3BJWEQ1N2o3WHFIWjhzQXUzbmdZQmRtVFBzOW9STW9VSWVGb09zTWU1cU5iUnAycGhkSDlEMjlNbkdGZVI3TTdSUEdkend6WThEcmNDVnNlZjlYdnMzaXVmVXI4RWs3M2NZalVsSmZUUGxUaWR4eistdTdhc3llbGtaV1hVMlV6OEhqM1plRkV6NmJUQXIxL3RvR2t1Y3ZmNG82Tk4rLVphVUJ4bVh4YmVLNWNPdytBRDBBUFEt";

  // The body data (this should ideally be passed via req.body or be static as in your example)
  const requestData = {
    AgentInfo: agentInfo,
    SegmentInfo: segmentInfo,
    Trackid: trackId,
    ItineraryInfo: itenaryInfo,
  };

  try {
    // Send the POST request to the Availability API
    const response = await fetch(
      "http://testrws.mywebcheck.in/TravelAPI.svc/Pricing",
      {
        method: "POST",
        headers: {
          TOKEN: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData), // Send the request body as JSON
      }
    );

    // Check if the response was successful
    if (!response.ok) {
      return res.status(400).json({
        message: "Error with Availability API",
        details: response.statusText,
      });
    }
    // Parse the response JSON
    const data = await response.json();
    console.log("Pricing responce", data);
    // Send the data back to the client
    return res.status(200).json(data);
  } catch (error) {
    // Catch any errors and send an error response
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.post("/seatmap", async (req, res) => {
  const { segmentInfo, trackId, flightInfo, apipaxdetails } = req.body;

  console.log(segmentInfo);
  console.log(trackId);
  console.log(flightInfo);
  console.log(apipaxdetails);
  // Validate that all required fields are provided (basic example of validation)
  if (!segmentInfo || !trackId || !flightInfo || !apipaxdetails) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const token =
    "VWlQY2g4OUJJR1M2MFcrLWpwcTYvQm8zZ3dKb3NLWWdiazZuMjhrNW5nS3BJWEQ1N2o3WHFIWjhzQXUzbmdZQmRtVFBzOW9STW9VSWVGb09zTWU1cU5iUnAycGhkSDlEMjlNbkdGZVI3TTdSUEdkend6WThEcmNDVnNlZjlYdnMzaXVmVXI4RWs3M2NZalVsSmZUUGxUaWR4eistdTdhc3llbGtaV1hVMlV6OEhqM1plRkV6NmJUQXIxL3RvR2t1Y3ZmNG82Tk4rLVphVUJ4bVh4YmVLNWNPdytBRDBBUFEt";

  // The body data (this should ideally be passed via req.body or be static as in your example)
  const requestData = {
    AgentInfo: agentInfo,
    SegmentInfo: segmentInfo,
    FlightsInfo: flightInfo,
    APIPaxDetails: apipaxdetails,
    TrackId: trackId,
  };
  try {
    // Send the POST request to the Availability API
    const response = await fetch(
      "http://testrws.mywebcheck.in/TravelAPI.svc/GetAvailSeatMap",
      {
        method: "POST",
        headers: {
          TOKEN: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData), // Send the request body as JSON
      }
    );

    // Check if the response was successful
    if (!response.ok) {
      return res.status(400).json({
        message: "Error with Availability API",
        details: response.statusText,
      });
    }
    // Parse the response JSON
    const data = await response.json();
    console.log("Seatmap responce", data);
    // Send the data back to the client
    return res.status(200).json(data);
  } catch (error) {
    // Catch any errors and send an error response
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});
app.post("/booking", async (req, res) => {
  const {
    AdultCount,
    ChildCount,
    InfantCount,
    ItineraryFlightsInfo,
    PaxDetailsInfo,
    AddressDetails,
    TripType,
    TrackId,
  } = req.body;
  console.log(AdultCount, "Adult coint");
  console.log(ChildCount, "child count");
  console.log(InfantCount, "infant count");

  // Validate that all required fields are provided (basic example of validation)
  if (
    !AdultCount ||
    !ItineraryFlightsInfo ||
    !TrackId ||
    !PaxDetailsInfo ||
    !AddressDetails
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const token =
    "VWlQY2g4OUJJR1M2MFcrLWpwcTYvQm8zZ3dKb3NLWWdiazZuMjhrNW5nS3BJWEQ1N2o3WHFIWjhzQXUzbmdZQmRtVFBzOW9STW9VSWVGb09zTWU1cU5iUnAycGhkSDlEMjlNbkdGZVI3TTdSUEdkend6WThEcmNDVnNlZjlYdnMzaXVmVXI4RWs3M2NZalVsSmZUUGxUaWR4eistdTdhc3llbGtaV1hVMlV6OEhqM1plRkV6NmJUQXIxL3RvR2t1Y3ZmNG82Tk4rLVphVUJ4bVh4YmVLNWNPdytBRDBBUFEt";
  // The body data (this should ideally be passed via req.body or be static as in your example)
  const requestdata = {
    AgentInfo: agentInfo,
    AdultCount: 1,
    ChildCount: ChildCount ? ChildCount : "0",
    InfantCount: InfantCount ? InfantCount : "0",
    ItineraryFlightsInfo: ItineraryFlightsInfo,
    PaxDetailsInfo: PaxDetailsInfo,
    AddressDetails: AddressDetails,
    GSTInfo: {
      GSTNumber: "",
      GSTCompanyName: "",
      GSTAddress: "",
      GSTEmailID: "",
      GSTMobileNumber: "",
    },
    TripType: TripType === "O" ? "O" : "R",
    BlockPNR: true,
    Faremasking: false,
    BaseOrigin: "HYD",
    BaseDestination: "DEL",
    TrackId: TrackId,
  };
  // res.send(requestdata);
  try {
    // Send the POST request to the Availability API
    const response = await fetch(
      "http://testrws.mywebcheck.in/TravelAPI.svc/Book",
      {
        method: "POST",
        headers: {
          TOKEN: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestdata), // Send the request body as JSON
      }
    );

    // Check if the response was successful
    if (!response.ok) {
      return res.status(400).json({
        message: "Error with Availability API",
        details: response.statusText,
      });
    }
    // Parse the response JSON
    const data = await response.json();
    console.log("Seatmap responce", data);
    // Send the data back to the client
    return res.status(200).json(data);
  } catch (error) {
    // Catch any errors and send an error response
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});
app.post("/ticketing", async (req, res) => {
  const { BookingTrackId, RiyaPNR, AirlinePNR, BookingAmount } = req.body;
  // Validate that all required fields are provided (basic example of validation)
  if (!BookingTrackId || !RiyaPNR || !AirlinePNR || !BookingAmount) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const token =
    "VWlQY2g4OUJJR1M2MFcrLWpwcTYvQm8zZ3dKb3NLWWdiazZuMjhrNW5nS3BJWEQ1N2o3WHFIWjhzQXUzbmdZQmRtVFBzOW9STW9VSWVGb09zTWU1cU5iUnAycGhkSDlEMjlNbkdGZVI3TTdSUEdkend6WThEcmNDVnNlZjlYdnMzaXVmVXI4RWs3M2NZalVsSmZUUGxUaWR4eistdTdhc3llbGtaV1hVMlV6OEhqM1plRkV6NmJUQXIxL3RvR2t1Y3ZmNG82Tk4rLVphVUJ4bVh4YmVLNWNPdytBRDBBUFEt";
  // The body data (this should ideally be passed via req.body or be static as in your example)
  const requestdata = {
    AgentInfo: agentInfo,
    BookingTrackId: BookingTrackId,
    RiyaPNR: RiyaPNR,
    AirlinePNR: AirlinePNR,
    BookingAmount: BookingAmount,
    PaymentMode: "T",
  };
  // res.send(requestdata);
  try {
    // Send the POST request to the Availability API
    const response = await fetch(
      "http://testrws.mywebcheck.in/TravelAPI.svc/IssueTicket",
      {
        method: "POST",
        headers: {
          TOKEN: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestdata), // Send the request body as JSON
      }
    );

    // Check if the response was successful
    if (!response.ok) {
      return res.status(400).json({
        message: "Error with Availability API",
        details: response.statusText,
      });
    }
    // Parse the response JSON
    const data = await response.json();
    console.log("ticketing responce", data);
    // Send the data back to the client
    return res.status(200).json(data);
  } catch (error) {
    // Catch any errors and send an error response
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});
module.exports = app;
