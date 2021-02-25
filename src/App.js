import { useEffect, useState } from "react";
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
  const [dimensionNodes, setDimensionNodes] = useState();
  const [csvFile, setCsvFile] = useState();

  const [arffFile, setArffFile] = useState();
  const [textOfArffFile, setTextofArffFile] = useState();
  const [outputFile, setOutputFile] = useState();

  const reader = new FileReader();

  const [initMatrix, setInitMatrix] = useState();
  const [finalMatrix, setFinalMatrix] = useState();
  const [differenceMatrix, setDifferenceMatrix] = useState();

  const [linksRemoved, setLinksRemoved] = useState(0)
  const [linksAdded, setLinksAdded] = useState(0)
  const [linksModified, setLinksModified] = useState(0)

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

      setDimensionNodes(dataObj.nodesD);
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

      setInitMatrix(matrix);

      textByLine.forEach((line) => {
        var arrayOfLine = line.split(" ");
        if (arrayOfLine[0] !== "p") {
          let from = arrayOfLine[0];
          let to = arrayOfLine[1];
          dataObj.linkedNodes.push(from);
          dataObj.linkedNodes.push(to);
        }
      });

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

      setCsvFile(csv);
    }
  }, [textOfInputFile]);

  //
  //Extract text from .arff file and save it when .arff file becomes available
  useEffect(() => {
    if (arffFile !== undefined) {
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
      var textByLine = textOfArffFile.split("\n");
      textByLine = textByLine.filter((line) => line !== "");
      textByLine = textByLine.filter((line) => line.split("")[0] !== "@");
      textByLine = textByLine.map((line) => line.split(","));

      let lastIndex = parseInt(dimensionNodes) + 2;

      var pairsArray = [];
      textByLine.forEach((row) => {
        var nodeOnCluster = {
          node: row[1],
          cluster: row[lastIndex],
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

      var matrix = [];

      for (let i = 0; i < dimensionNodes; i++) {
        matrix.push([]);
      }
      matrix.forEach((row) => {
        for (let i = 0; i < dimensionNodes; i++) {
          row.push(0);
        }
      });
      //
      //
      // console.log(finLinks);
      finLinks.forEach((linkObj) => {
        matrix[parseInt(linkObj.x) - 1][parseInt(linkObj.y) - 1] = 1;
        matrix[parseInt(linkObj.y) - 1][parseInt(linkObj.x) - 1] = 1;
      });
      //
      //
      setFinalMatrix(matrix);
      console.log("final matrix", matrix);
    }
  }, [textOfArffFile]);
  //
  //
  useEffect(() => {
    var matrix = [];

    for (let i = 0; i < dimensionNodes; i++) {
      matrix.push([]);
    }
    matrix.forEach((row) => {
      for (let i = 0; i < dimensionNodes; i++) {
        row.push(0);
      }
    });

    let addCount = 0
    let removeCount = 0

    for (let z = 0; z < dimensionNodes; z++) {
      for (let x = 0; x < dimensionNodes; x++) {
        if (initMatrix[z][x] !== finalMatrix[z][x]) {
          matrix[z][x] = 1;
          if (initMatrix[z][x] === 0 && finalMatrix[z][x] === 1) {
            addCount++
          }
          if (initMatrix[z][x] === 1 && finalMatrix[z][x] === 0) {
            removeCount++
          }
        }
      }
    }
    console.log("added and removed " + addCount + "  " + removeCount);
    setLinksAdded(addCount)
    setLinksRemoved(removeCount)
    setLinksModified(addCount + removeCount)
    console.log("difference matrix", matrix);
    setDifferenceMatrix(matrix);
  }, [finalMatrix]);

  useEffect(() => {
    if (differenceMatrix !== undefined) {
      var out = "";
      for (let c = 0; c < dimensionNodes; c++) {
        for (let v = 0; v < dimensionNodes; v++) {
          if (c < v && differenceMatrix[c][v] === 1) {
            if (out.length === 0) {
              out += `${c + 1} ${v + 1}`;
            } else {
              out += `\n${c + 1} ${v + 1}`;
            }
          }
        }
      }

      // console.log(out);
      setOutputFile(out);
    }
  }, [differenceMatrix]);

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
    downloadFile(inputFile.name, outputFile, "Outputttt.txt");
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
              setLinksAdded(0)
              setLinksRemoved(0)
              setLinksModified(0)
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
              setLinksAdded(0)
              setLinksRemoved(0)
              setLinksModified(0)
              document.getElementById("arffUpload").value = null;
            }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: "column", width: "100%", height: "100vh" }}>
        <text style={{ fontWeight: 'bold' }}>{`Links added: ${linksAdded}`}</text>
        <text style={{ fontWeight: 'bold' }}>{`Links removed: ${linksRemoved}`}</text>
        <text style={{ fontWeight: 'bold' }}>{`Total modified (removed or added): ${linksModified}`}</text>
      </div>
    </div>
  );
};

export default App;
