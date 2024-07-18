type PropsType = {
  headers: string[];
  data: any[][];
  options?: {
    noBorderFirstCol?: boolean;
  };
};

const defaultTableDataClass =
  "border border-cardborder py-2 sm:py-4 px-4 border-r-transparent border-b-transparent";

function getExtraClassName(row: number, col: number, props: PropsType) {
  let extraClass = [];
  if (props.options?.noBorderFirstCol) {
    // If the first column should not have a border
    if (col == 0) {
      extraClass.push(
        "border-l-transparent border-t-transparent !border-b-transparent"
      );
      return extraClass.join(" ");
    }
    // Then the second one will
    if (col == 1) {
      extraClass.push("border-l-cardborder");
      if (row == 0) {
        extraClass.push("rounded-tl-2xl");
      }
    }
  } else {
    // If the first column should have a border
    if (col == 0) {
      extraClass.push("border-l-cardborder");
    }
  }
  if (col == props.data[0].length - 1) {
    // The last column should have a right border
    extraClass.push("!border-r-cardborder");
  }
  if (row == 0) {
    if (props.options?.noBorderFirstCol) {
      if (col == 1) {
        extraClass.push("rounded-tl-2xl");
      }
    } else {
      if (col == 0) {
        extraClass.push("rounded-tl-2xl");
      }
    }
  }
  if (row == 0 && col == props.data[0].length - 1) {
    // Top right cell should be rounded
    extraClass.push("rounded-tr-2xl");
  }
  if (row == props.data.length - 1) {
    extraClass.push("!border-b-cardborder");
    // The last row
    if (props.options?.noBorderFirstCol) {
      if (col == 1) {
        extraClass.push("rounded-bl-2xl");
      }
    } else {
      if (col == 0) {
        extraClass.push("rounded-bl-2xl");
      }
    }
    if (col == props.data[0].length - 1) {
      extraClass.push("rounded-br-2xl");
    }
  }
  return extraClass.join(" ");
}

export function Table(props: PropsType) {
  return (
    <table
      className="w-full border-separate rounded-2xl mt-8 text-base"
      border={0}
      cellSpacing={0}
      cellPadding={0}
    >
      <thead>
        <tr>
          {props.headers.map((header, i) => (
            <th key={i} className="px-2 text-nowrap">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="rounded-2xl before:leading-[6px] before:content-['-'] before:text-transparent before:bg-transparent">
        {props.data.map((d, i) => (
          <tr key={i} className={`text-center bg-white`}>
            {d.map((data, j) => (
              <td
                key={j}
                className={`${defaultTableDataClass} ${getExtraClassName(
                  i,
                  j,
                  props
                )}`}
              >
                {data}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
