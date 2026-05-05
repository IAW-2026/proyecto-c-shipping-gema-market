import { Header } from "../../_components/page-layout";
import { AvailableActions } from "./button-actions";


export function SettlementsHeader() {
    return (
        <Header
            title={"Mis ganancias"}
            subtitle="Liquidaciones"
            action={<AvailableActions />}

        />
    );
}