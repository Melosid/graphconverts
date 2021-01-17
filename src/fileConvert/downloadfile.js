const downloadFile = (name, file, extention) => {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(file)
  );
  var newName = name.substr(0, name.length - 3) + extention;
  element.setAttribute("download", newName);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

export default downloadFile;
