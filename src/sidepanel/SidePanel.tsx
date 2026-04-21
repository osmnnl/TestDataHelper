import { Popup } from "../popup/Popup";
import { SmartFillBar } from "./SmartFillBar";
import "./SidePanel.css";

/**
 * Side panel; popup'ın aynısını gösterir + üstte aktif sekmedeki formu
 * persona ile doldurma kısayolu.
 */
export function SidePanel() {
  return (
    <div className="sidepanel">
      <SmartFillBar />
      <Popup />
    </div>
  );
}
