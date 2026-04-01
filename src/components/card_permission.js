import { Card, Center, Text, Stack, Button } from "@mantine/core";
import { IconLockAccess } from "@tabler/icons-react";
import Head from "next/head";

export default function NoPermissionCard() {
    return (
        <>
            <Head>
                <title>Access Denied - MC</title>
            </Head>

            <Center h="80vh" px="md">
                <Card
                    shadow="lg"
                    radius="lg"
                    padding="xl"
                    withBorder
                    className="w-full max-w-xl"
                >
                    <Stack align="center" gap="lg">
                        <IconLockAccess size={96} stroke={1.5} color="gray" />

                        <Text fw={700} size="xl" ta="center">
                            Access Denied
                        </Text>

                        <Text c="dimmed" ta="center" size="md">
                            You don’t have permission to access this page.
                            Please contact your administrator if you think this is a mistake.
                        </Text>

                        <Button size="md" variant="light" mt="md" onClick={() => window.history.back()}>
                            Go Back
                        </Button>
                    </Stack>
                </Card>
            </Center>
        </>
    );
}
