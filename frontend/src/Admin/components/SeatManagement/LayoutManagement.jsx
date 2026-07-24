import { useState } from "react";
import { createSeatLayout } from "../../../services/seatLayoutService";
import styles from "./SeatManagement.module.css";

const LayoutManagement = ({ onLayoutCreated }) => {
  const [name, setName] = useState("");
  const [totalRows, setTotalRows] = useState(3);
  const [totalCols, setTotalCols] = useState(9);
  const [aisleCol, setAisleCol] = useState(5);
  const [seats, setSeats] = useState([]);
  const [aisleType, setAisleType] = useState("MIDDLE");
  const [rowTypes, setRowTypes] = useState({});

  const getSeatConfigByType = (seatType) => {
    switch (seatType) {
      case "VIP":
        return {
          seatType: "VIP",
          price: 120000,
          colSpan: 1
        };

      case "COUPLE":
        return {
          seatType: "COUPLE",
          price: 160000,
          colSpan: 2
        };

      case "REGULAR":
      default:
        return {
          seatType: "REGULAR",
          price: 80000,
          colSpan: 1
        };
    }
  };
  const isAisleColumn = (col, totalCols) => {
    if (aisleType === "MIDDLE") {
      const middleCol = Math.ceil(totalCols / 2);
      return col === middleCol;
    }

    if (aisleType === "SIDES") {
      return col === 1 || col === totalCols;
    }

    if (aisleType === "CUSTOM") {
      return col === Number(aisleCol);
    }

    return false;
  };

  const generateLayout = () => {
    const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const generatedSeats = [];

    const rows = Number(totalRows);
    const cols = Number(totalCols);

    for (let r = 1; r <= rows; r++) {
      const row = rowLabels[r - 1];
      let seatNumberInRow = 1;
      let c = 1;

      while (c <= cols) {
        if (isAisleColumn(c, cols)) {
          c++;
          continue;
        }

        const rowSeatType = rowTypes[r] || "REGULAR";
        const seatConfig = getSeatConfigByType(rowSeatType);

        if (seatConfig.seatType === "COUPLE") {
          const nextCol = c + 1;

          if (nextCol > cols || isAisleColumn(nextCol, cols)) {
            c++;
            continue;
          }
        }

        generatedSeats.push({
          seatNumber: `${row}${seatNumberInRow}`,
          row: row,
          column: seatNumberInRow,

          rowIndex: r,
          colIndex: c,
          colSpan: seatConfig.colSpan,

          seatType: seatConfig.seatType,
          price: seatConfig.price,
        });

        seatNumberInRow++;
        c += seatConfig.colSpan;
      }
    }

    setSeats(generatedSeats);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Please enter a layout name");
      return;
    }

    if (seats.length === 0) {
      alert("Please create seats before saving the layout");
      return;
    }

    const payload = {
      name,
      totalRows: Number(totalRows),
      totalCols: Number(totalCols),
      aisleType,
      seats
    };

    await createSeatLayout(payload);

    alert("Create layout successfully");

    setName("");
    setSeats([]);

    if (onLayoutCreated) {
      onLayoutCreated();
    }
  };

  return (
    <div className={styles.layoutManagement}>
      <h3>Layout Management</h3>

      <div className={styles.addSeatForm}>
        <h4>Tạo layout ghế</h4>

        <div className={styles.formRow}>
          <input
            type="text"
            placeholder="Layout name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="number"
            min="1"
            value={totalRows}
            onChange={(e) => setTotalRows(Number(e.target.value))}
            placeholder="Rows"
          />

          <input
            type="number"
            min="1"
            value={totalCols}
            onChange={(e) => setTotalCols(Number(e.target.value))}
            placeholder="Columns"
          />
          {aisleType === "CUSTOM" && (
            <input
              type="number"
              min="1"
              max="totalCols"
              value={aisleCol}
              onChange={(e) => setAisleCol(Number(e.target.value))}
              placeholder="Aisle Column"
            />
          )}
          <div className={styles.rowTypeConfig}>
            <h4>Seat type by row</h4>

            {Array.from({ length: Number(totalRows) }, (_, index) => {
              const rowIndex = index + 1;
              const rowLabel = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[index];

              return (
                <div key={rowIndex} className={styles.rowTypeItem}>
                  <span>Row {rowLabel}</span>

                  <select
                    value={rowTypes[rowIndex] || "REGULAR"}
                    onChange={(e) =>
                      setRowTypes((prev) => ({
                        ...prev,
                        [rowIndex]: e.target.value
                      }))
                    }
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="VIP">VIP</option>
                    <option value="COUPLE">Couple</option>
                  </select>
                </div>
              );
            })}
          </div>
          <select
            value={aisleType}
            onChange={(e) => setAisleType(e.target.value)}
          >
            <option value="NONE">No aisle</option>
            <option value="MIDDLE">Aisle in the middle</option>
            <option value="SIDES">Aisle on both sides</option>
            <option value="CUSTOM">Custom Aisle</option>
          </select>


          <button onClick={generateLayout} className={styles.btnGenerate}>
            Create preview
          </button>

          <button onClick={handleSubmit} className={styles.btnSave}>
            Save layout
          </button>
        </div>
      </div>

      <h4>Preview layout ({seats.length} ghế)</h4>

      <div
        className={styles.previewSeatMap}
        style={{
          gridTemplateColumns: `repeat(${totalCols}, 60px)`,
        }}
      >
        {seats.map((seat, index) => (
          <div
            key={index}
            className={`${styles.previewSeat} ${styles[seat.seatType.toLowerCase()]}`}
            style={{
              gridRow: seat.rowIndex,
              gridColumn: `${seat.colIndex} / span ${seat.colSpan || 1}`,
            }}
          >
            <span className={styles.previewSeatNumber}>{seat.seatNumber}</span>
            <span className={styles.previewSeatType}>{seat.seatType}</span>
            <span className={styles.previewSeatPrice}>
              {Number(seat.price).toLocaleString("vi-VN")}₫
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayoutManagement;