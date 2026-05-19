import { Header } from "../../_components/page-layout";
import { HeaderActions } from "./available-actions";


export function AvailableHeader() {
    return (
        <Header
            title={"Envios por tomar"}
            subtitle="Disponibles"
            action={<HeaderActions />}
        />
    );
}