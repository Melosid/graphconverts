import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faFileDownload,
  faFileUpload,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

const App = () => {
  const [inputFile, setInputFile] = useState();
  const [textOfInputFile, setTextOfInputFile] = useState();
  const [dataObject, setDataObject] = useState();
  const [csvFile, setCsvFile] = useState();

  const [arffFile, setArffFile] = useState();
  const [textOfArffFile, setTextofArffFile] = useState();
  const [outputFile, setOutputFile] = useState();

  const reader = new FileReader();

  const [initialLinks, setInitialLinks] = useState();
  const [finalLinks, setFinalLinks] = useState();

  //
  //Extract text from .gr file and save it when .gr becomes available
  useEffect(() => {
    if (inputFile !== undefined) {
      console.log(inputFile);
      reader.readAsText(inputFile, "utf-8");
      reader.onload = (event) => {
        setTextOfInputFile(event.target.result);
      };
    }
  }, [inputFile]);

  //
  //Convert input file .gr to csv file
  useEffect(() => {
    if (textOfInputFile !== undefined) {
      var textByLine = textOfInputFile.split("\n");
      textByLine = textByLine.filter((line) => line !== "");
      // console.log(textByLine);

      var dataObj = {
        nodesD: 0,
        linksD: 0,
        linkedNodes: [],
      };
      var csv = "Nodes";
      var initLinks = [];

      textByLine.forEach((row) => {
        var arrayOfLine = row.split(" ");
        if (arrayOfLine[0] === "p") {
          dataObj.nodes = arrayOfLine[2];
          dataObj.links = arrayOfLine[3];
        } else {
          if (!dataObj.linkedNodes.includes(arrayOfLine[0])) {
            dataObj.linkedNodes.push(arrayOfLine[0]);
          }
          if (!dataObj.linkedNodes.includes(arrayOfLine[1])) {
            dataObj.linkedNodes.push(arrayOfLine[1]);
          }

          //add to initialLinks
          initLinks.push({
            x: arrayOfLine[0],
            y: arrayOfLine[1],
          });
        }
      });

      dataObj.linkedNodes = dataObj.linkedNodes.sort((a, b) => a - b);
      // console.log(dataObj.linkedNodes);
      setDataObject(dataObj);
      console.log(initLinks);
      setInitialLinks(initLinks);

      dataObj.linkedNodes.forEach((node) => {
        csv = csv + `\n ${node}`;
      });
      // console.log(csv);
      setCsvFile(csv);
    }
  }, [textOfInputFile]);

  //
  //Extract text from .arff file and save it when .arff file becomes available
  useEffect(() => {
    if (arffFile !== undefined) {
      console.log(arffFile);
      reader.readAsText(arffFile, "utf-8");
      reader.onload = (event) => {
        setTextofArffFile(event.target.result);
      };
    }
  }, [arffFile]);

  //
  //Convert arff file to output file
  useEffect(() => {
    if (textOfArffFile !== undefined) {
      // console.log(textOfArffFile);

      var textByLine = textOfArffFile.split("\n");
      textByLine = textByLine.filter((line) => line !== "");
      textByLine = textByLine.filter((line) => line.split("")[0] !== "@");
      textByLine = textByLine.map((line) => line.split(","));

      // console.log(textByLine);

      var pairsArray = [];
      textByLine.forEach((row) => {
        var nodeOnCluster = {
          node: row[1],
          cluster: row[2],
        };

        pairsArray.push(nodeOnCluster);
      });

      var finLinks = [];
      pairsArray.forEach((pairOne, indexOne) => {
        pairsArray.forEach((pairTwo, indexTwo) => {
          if (indexOne < indexTwo && pairOne.cluster === pairTwo.cluster) {
            finLinks.push({
              x: pairOne.node,
              y: pairTwo.node,
            });
          }
        });
      });

      // console.log(pairsArray);
      console.log(finLinks);
      setFinalLinks(finLinks);
    }
  }, [textOfArffFile]);

  useEffect(() => {
    if (initialLinks !== undefined && finalLinks !== undefined) {
      var modifiedArray = [];

      initialLinks.forEach((linkInit) => {
        var similar = finalLinks.find(
          (linkFin) => linkFin.x === linkInit.x && linkFin.y === linkInit.y
        );
        if (similar === undefined) {
          modifiedArray.push(linkInit);
        }
      });

      finalLinks.forEach((linkFin) => {
        var similar = initialLinks.find(
          (linkInit) => linkInit.x === linkFin.x && linkInit.y === linkFin.y
        );
        if (similar === undefined) {
          modifiedArray.push(linkFin);
        }
      });

      console.log(modifiedArray);

      var out = "";
      modifiedArray.forEach((modlink) => {
        if (out.length === 0) {
          out = out + `${modlink.x} ${modlink.y}`;
        } else {
          out = out + `\n${modlink.x} ${modlink.y}`;
        }
      });

      setOutputFile(out);
    }
  }, [finalLinks]);

  //
  //upload gr input file
  const handleFileUpload = (event) => {
    setInputFile(event.target.files[0]);
  };

  //
  //download csv file
  const handleDownload = () => {
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(csvFile)
    );
    var newName =
      inputFile.name.substr(0, inputFile.name.length - 3) + "Converted.csv";
    element.setAttribute("download", newName);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  };

  //
  // upload arff input file
  const handleArffFileUpload = (event) => {
    setArffFile(event.target.files[0]);
  };

  //
  //download out file
  const handleOutFileDownload = () => {
    //handle output file download
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(outputFile)
    );
    var newName =
      inputFile.name.substr(0, inputFile.name.length - 3) + "Converted.txt";
    element.setAttribute("download", newName);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  };

  //
  //
  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          display: "inline-block",
          paddingLeft: "10px",
          width: "400px",
          height: "100vh",
          backgroundColor: "#fafafa",
        }}
      >
        {/* div of gr input starts */}
        <div>
          <h5>Choose your input file (.gr) and download csv file</h5>
          <input
            id="grUpload"
            type="file"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </div>
        <div style={{ display: "flex" }}>
          <div>{inputFile ? inputFile.name : "Upload file"}</div>
          <div style={{ marginLeft: "50px" }}>
            {inputFile ? "Download CSV" : ""}
          </div>
        </div>
        <div
          style={{
            display: "inline-block",
          }}
        >
          {inputFile === undefined ? (
            <FontAwesomeIcon
              id="uploadIcon"
              icon={faFileUpload}
              size="7x"
              style={{ marginTop: "10px" }}
              onClick={() => {
                document.getElementById("grUpload").click();
              }}
              onMouseOver={() =>
                (document.getElementById("uploadIcon").style.color = "grey")
              }
              onMouseOut={() =>
                (document.getElementById("uploadIcon").style.color = "black")
              }
            />
          ) : (
            <FontAwesomeIcon
              id="fileIcon"
              icon={faFileAlt}
              size="7x"
              style={{ marginTop: "10px", color: "black" }}
            />
          )}
          <FontAwesomeIcon
            id="downloadIcon"
            icon={faFileDownload}
            size="7x"
            style={{ marginTop: "10px", marginLeft: "50px" }}
            onClick={handleDownload}
            onMouseOver={() =>
              (document.getElementById("downloadIcon").style.color = "grey")
            }
            onMouseOut={() =>
              (document.getElementById("downloadIcon").style.color = "black")
            }
          />
          <FontAwesomeIcon
            id="clearIcon"
            icon={faTimesCircle}
            size="2x"
            style={{
              marginTop: "10px",
              marginLeft: "50px",
              marginBottom: "70px",
              color: "black",
            }}
            onClick={() => {
              setInputFile(undefined);
              setTextOfInputFile(undefined);
              setCsvFile(undefined);
              setDataObject(undefined);
              document.getElementById("grUpload").value = null;
            }}
            onMouseOver={() =>
              (document.getElementById("clearIcon").style.color = "grey")
            }
            onMouseOut={() =>
              (document.getElementById("clearIcon").style.color = "black")
            }
          />
        </div>
        {/* <div>
          <h5>
            Add your (.arff) file to the (.gr) file above and download output
            file
          </h5>{" "}
          <input type="file" onChange={handleArffFileUpload} />
          <button onClick={handleOutFileDownload}>Download Output File</button>
          {arffFile ? <h4>File chosen: {arffFile.name}</h4> : ""}
        </div> */}
        <div>
          <h5>Choose your input file (.arff) and download out file</h5>
          <input
            id="arffUpload"
            type="file"
            onChange={handleArffFileUpload}
            style={{ display: "none" }}
          />
        </div>
        <div style={{ display: "flex" }}>
          <div>{arffFile ? arffFile.name : "Upload file"}</div>
          <div style={{ marginLeft: "50px" }}>
            {arffFile ? "Download Out" : ""}
          </div>
        </div>
        <div
          style={{
            display: "inline-block",
          }}
        >
          {arffFile === undefined ? (
            <FontAwesomeIcon
              id="uploadIcon2"
              icon={faFileUpload}
              size="7x"
              style={{ marginTop: "10px" }}
              onClick={() => {
                document.getElementById("arffUpload").click();
              }}
              onMouseOver={() =>
                (document.getElementById("uploadIcon2").style.color = "grey")
              }
              onMouseOut={() =>
                (document.getElementById("uploadIcon2").style.color = "black")
              }
            />
          ) : (
            <FontAwesomeIcon
              id="fileIcon2"
              icon={faFileAlt}
              size="7x"
              style={{ marginTop: "10px", color: "black" }}
            />
          )}
          <FontAwesomeIcon
            id="downloadIcon2"
            icon={faFileDownload}
            size="7x"
            style={{ marginTop: "10px", marginLeft: "50px" }}
            onClick={handleOutFileDownload}
            onMouseOver={() =>
              (document.getElementById("downloadIcon2").style.color = "grey")
            }
            onMouseOut={() =>
              (document.getElementById("downloadIcon2").style.color = "black")
            }
          />
          <FontAwesomeIcon
            id="clearIcon2"
            icon={faTimesCircle}
            size="2x"
            style={{
              marginTop: "10px",
              marginLeft: "50px",
              marginBottom: "70px",
              color: "black",
            }}
            onClick={() => {
              setArffFile(undefined);
              setTextofArffFile(undefined);
              setOutputFile(undefined);
              document.getElementById("arffUpload").value = null;
            }}
            onMouseOver={() =>
              (document.getElementById("clearIcon2").style.color = "grey")
            }
            onMouseOut={() =>
              (document.getElementById("clearIcon2").style.color = "black")
            }
          />
        </div>
      </div>
      <div style={{ width: "100%", height: "100vh" }}>
        {/* <svg ref={svgEl} style={{ width: "100%", height: "100%" }}></svg> */}
      </div>
    </div>
  );
};

export default App;
