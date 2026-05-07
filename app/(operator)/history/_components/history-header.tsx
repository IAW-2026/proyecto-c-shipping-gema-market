import { Header } from "../../_components/page-layout";
import { ExportActions } from "./export-actions";

export function HistoryHeader() {
    return (
        <Header
            title={"Historial de envíos"}
            subtitle="Estados"
            action={<ExportActions />}
        />
    );
}