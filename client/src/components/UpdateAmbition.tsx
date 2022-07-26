import { useEffect, useState } from "react";
import { Button, NativeSelect, TextInput, Loader, Textarea, Modal } from "@mantine/core";
import { CATEGORY_IDENTITIES } from "../utils/queries";
import { UPDATE_AMBITION } from "../utils/mutations";
import { useMutation, useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import PublicAmbition from "./PublicAmbition";
import { WorldUpload } from "tabler-icons-react";

export default function UpdateAmbition() {
    
    const { loading, data } = useQuery(CATEGORY_IDENTITIES, {
        fetchPolicy: "cache-and-network"
    });

    const identitiesData = data?.identities || [];

    const [updateAmbition, { error }] = useMutation(UPDATE_AMBITION);

    const state: any = useSelector(state => state);
    

    const [identity, setIdentity] = useState(state.identity); // default states need to be set
    const [dailyPlan, setDailyPlan] = useState(state.dailyPlan); // how they are going to get there
    const [endValue, setEndValue] = useState(state.endValue); // where they want to be

    const [dailyErr, setDailyErr] = useState("");
    const [endErr, setEndErr] = useState("");
    const [disableButton, setDisableButton] = useState(true);

    const [opened, setOpened] = useState(false);
    
    useEffect(() => {
        setIdentity(state.identity)
        setDailyPlan(state.dailyPlan)
        setEndValue(state.endValue)
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened])
    
    useEffect(() => {
        if (endValue) { // ensures validation isn't fired off on load
            Number(endValue) ? setEndErr("") : setEndErr("Your ending value must be numbers only, e.g. 88.8");
        }
        
        dailyPlan.length > 1000 ? setDailyErr("You cannot type more than 1000 characters.") : setDailyErr("");
        dailyPlan.length === 0 ? setDailyErr("You need a daily plan if you are going to achieve something.") : setDailyErr("");

        (Number(endValue) && dailyPlan.length <= 1000 && dailyPlan.length > 0) ? setDisableButton(false) : setDisableButton(true) // to enable/disable submit button

    }, [endValue, dailyPlan])

    const handleAmbitionSubmit = async (event: any) => {
        event.preventDefault();
        
        try {
            const { data } = await updateAmbition({
                variables: {
                    ambitionId: state.ambitionId,
                    identity: identity,
                    dailyPlan: dailyPlan,
                    endValue: endValue,
                },
            });
            } catch (error) {
                console.log(error);
            }

            setOpened(false);      
    };

    return (
        <>
            {loading ? (
                <Loader color="red" size="xl" />
            ) : (

            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title="Update Ambition?"
                >     

            <form onSubmit={handleAmbitionSubmit}>
            
            <NativeSelect
                label="Has your ego changed?"
                description="I am..."
                data={identitiesData.map((data: any) => {
                    return data.identityCategories
                })}
                required
                value={identity}
                onChange={(event) => setIdentity(event.target.value)}
            />
    
            <TextInput // end value
                required // requires entry
                label="Are you changing the end value?"
                placeholder="Example: 5000.21"
                value={endValue}
                onChange={(event) => setEndValue(event.target.value)}
                error={endErr}
                />
    
            <Textarea // start value
                required // requires entry
                label="Has your daily plan changed?"
                placeholder="When I wake up, then I will do something. When it is 11:30am, then I will do something else."
                value={dailyPlan}
                onChange={(event) => setDailyPlan(event.target.value)}
                error={dailyErr}
                />
    
                <Button fullWidth mt="md" radius="lg" variant="outline" color="teal" disabled={disableButton} type="submit">Change!</Button>
                <PublicAmbition />
            </form>
            </Modal>
            
            )}

                <Button leftIcon={<WorldUpload size={24} strokeWidth={2} color={'cyan'}/>} radius="lg" fullWidth mt="sm" variant="outline" color="cyan" onClick={() => setOpened(true)}>Update Ambition</Button>
            </>
        );
}
