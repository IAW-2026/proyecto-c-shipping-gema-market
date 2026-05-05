import { Header } from "../../_components/page-layout";
import { AvailableActions } from "./button-actions";



export function HistoryHeader() {
    return (
        <Header
            title={"Historial de envíos"}
            subtitle="Estados"
            action={<AvailableActions />}
        />
    );
}