import { Header } from "../../_components/page-layout";
import { ReceiptActions } from "./receipt-actions";


export function SettlementsHeader() {
    return (
        <Header
            title={"Mis ganancias"}
            subtitle="Liquidaciones"
            action={<ReceiptActions />}

        />
    );
}