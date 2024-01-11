import './Gironi.css';

const Gironi = ({socket, bacchiatori}) => {

  const calcGironi = () => {
    const number = Object.entries(bacchiatori).length;
    
    return number;
  }

  return (
    <>
      {calcGironi()}
      <table>
        <tbody>
          <tr>
            <td>asd</td>
            <td>asd</td>
            <td>asd</td>
            <td>asd</td>
            <td>asd</td>
            <td>asd</td>
          </tr>
          <tr>
            <td>asd</td>
            <td>asd</td>
            <td>asd</td>
            <td>asd</td>
            <td>asd</td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

export default Gironi;