import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Icon = ({
  ID,
  faIconType,
  Klik,
  margTop,
  margLeft,
  margBottom,
  color,
  size,
}) => {
  return (
    <FontAwesomeIcon
      id={ID}
      icon={faIconType}
      size={size}
      style={{
        marginTop: margTop,
        marginLeft: margLeft,
        marginBottom: margBottom,
        color: color,
      }}
      onClick={Klik}
      onMouseOver={() => (document.getElementById(ID).style.color = "grey")}
      onMouseOut={() => (document.getElementById(ID).style.color = "black")}
    />
  );
};

export default Icon;
