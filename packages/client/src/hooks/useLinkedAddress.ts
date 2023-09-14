import { useEffect } from "react"
import { Account } from "src/network/components/clientComponents"

export const usePlayerLinkedAddress = () => {
    const player = Account.use()?.value


    useEffect(() => {
        if(!player) return;

        if
    }, [player])
}