import Link from "next/link";
import { Header } from "../../_components/page-layout";
import { AvailableActions } from "./button-actions";


export function AvailableHeader() {
    return (
        <Header
            title={"Envios por tomar"}
            subtitle="Disponibles"
            action={<AvailableActions />}
        />
    );
}