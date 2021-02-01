import { useEffect, useState, useRef } from "react";
import {
  faFileAlt,
  faFileDownload,
  faFileUpload,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import Icon from "./fileConvert/fileIcon";
import downloadFile from "./fileConvert/downloadfile";

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
      // var textByLine = textOfInputFile.split("\n");
      // textByLine = textByLine.filter((line) => line !== "");
      // // console.log(textByLine);

      // var dataObj = {
      //   nodesD: 0,
      //   linksD: 0,
      //   linkedNodes: [],
      // };
      // var csv = "Nodes";
      // var initLinks = [];

      // textByLine.forEach((row) => {
      // var arrayOfLine = row.split(" ");
      // if (arrayOfLine[0] === "p") {
      //   dataObj.nodes = arrayOfLine[2];
      //   dataObj.links = arrayOfLine[3];
      // } else {
      //     if (!dataObj.linkedNodes.includes(arrayOfLine[0])) {
      //       dataObj.linkedNodes.push(arrayOfLine[0]);
      //     }
      //     if (!dataObj.linkedNodes.includes(arrayOfLine[1])) {
      //       dataObj.linkedNodes.push(arrayOfLine[1]);
      //     }

      //     //add to initialLinks
      //     initLinks.push({
      //       x: arrayOfLine[0],
      //       y: arrayOfLine[1],
      //     });
      //   }
      // });

      // dataObj.linkedNodes = dataObj.linkedNodes.sort((a, b) => a - b);
      // // console.log(dataObj.linkedNodes);
      // setDataObject(dataObj);
      // console.log(initLinks);
      // setInitialLinks(initLinks);

      // dataObj.linkedNodes.forEach((node) => {
      //   csv = csv + `\n ${node}`;
      // });
      // console.log(csv);
      // setCsvFile(csv);

      var textByLine = textOfInputFile.split("\n");
      textByLine = textByLine.filter((line) => line !== "");

      var dataObj = {
        nodesD: 0,
        linksD: 0,
        linkedNodes: [],
      };

      textByLine.forEach((row) => {
        var arrayOfLine = row.split(" ");
        if (arrayOfLine[0] === "p") {
          dataObj.nodesD = arrayOfLine[2];
          dataObj.linksD = arrayOfLine[3];
        }
      });

      console.log(dataObj.nodesD, dataObj.linksD);
      var matrix = [];

      for (let i = 0; i < dataObj.nodesD; i++) {
        matrix.push([]);
      }
      matrix.forEach((row) => {
        for (let i = 0; i < dataObj.nodesD; i++) {
          row.push(0);
        }
      });

      textByLine.forEach((line) => {
        var arrayOfLine = line.split(" ");
        if (arrayOfLine[0] !== "p") {
          let from = arrayOfLine[0];
          let to = arrayOfLine[1];
          matrix[parseInt(from) - 1][parseInt(to) - 1] = 1;
          matrix[parseInt(to) - 1][parseInt(from) - 1] = 1;
        }
      });

      // console.log(matrix);

      var csv = "Node";
      for (let i = 0; i < dataObj.nodesD; i++) {
        csv += `, ${i + 1}`;
      }

      matrix.forEach((row, i) => {
        csv += `\n ${i + 1}`;
        row.forEach((el) => {
          csv += `, ${el}`;
        });
      });

      console.log(csv);
      setCsvFile(csv);
    }
  }, [textOfInputFile]);

  //
  //Extract text from .arff file and save it when .arff file becomes available
  useEffect(() => {
    if (arffFile !== undefined) {
      // console.log(arffFile);
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
      // console.log(finLinks);
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

      // console.log(modifiedArray);

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
    downloadFile(inputFile.name, csvFile, "Converted.csv");
  };

  //
  // upload arff input file
  const handleArffFileUpload = (event) => {
    setArffFile(event.target.files[0]);
  };

  //
  //download out file
  const handleOutFileDownload = () => {
    downloadFile(inputFile.name, outputFile, "Output.txt");
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
            <Icon
              ID="uploadIcon"
              faIconType={faFileUpload}
              Klik={() => {
                document.getElementById("grUpload").click();
              }}
              margTop="10px"
              size="7x"
            />
          ) : (
            <Icon
              ID="fileIcon"
              faIconType={faFileAlt}
              margTop="10px"
              color="black"
              size="7x"
            />
          )}
          <Icon
            ID="downloadIcon"
            faIconType={faFileDownload}
            Klik={handleDownload}
            // Klik={downloadFile(inputFile.name, csvFile, "Converted.csv")}
            margTop="10px"
            margLeft="50px"
            size="7x"
          />
          <Icon
            ID="clearIcon"
            faIconType={faTimesCircle}
            margTop="10px"
            margLeft="50px"
            margBottom="70px"
            size="2x"
            Klik={() => {
              setInputFile(undefined);
              setTextOfInputFile(undefined);
              setCsvFile(undefined);
              setDataObject(undefined);
              document.getElementById("grUpload").value = null;
            }}
          />
        </div>
        <div
          style={{
            marginTop: "20px",
            width: "95%",
            height: "2px",
            backgroundColor: "black",
          }}
        ></div>
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
            <Icon
              ID="uploadIcon2"
              faIconType={faFileUpload}
              Klik={() => {
                document.getElementById("arffUpload").click();
              }}
              margTop="10px"
              size="7x"
            />
          ) : (
            <Icon
              ID="fileIcon2"
              faIconType={faFileAlt}
              margTop="10px"
              color="black"
              size="7x"
            />
          )}
          <Icon
            ID="downloadIcon2"
            faIconType={faFileDownload}
            Klik={handleOutFileDownload}
            // Klik={downloadFile(inputFile.name, outputFile, "Output.txt")}
            margTop="10px"
            margLeft="50px"
            size="7x"
          />
          <Icon
            ID="clearIcon2"
            faIconType={faTimesCircle}
            margTop="10px"
            margLeft="50px"
            margBottom="70px"
            size="2x"
            Klik={() => {
              setArffFile(undefined);
              setTextofArffFile(undefined);
              setOutputFile(undefined);
              document.getElementById("arffUpload").value = null;
            }}
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
