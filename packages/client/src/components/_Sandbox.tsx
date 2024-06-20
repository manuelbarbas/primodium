import { Accordion } from "@/components/core/Accordion";
import { Badge } from "@/components/core/Badge";
import { Button } from "@/components/core/Button";
import { CapacityBar } from "@/components/core/CapacityBar";
import { Card, SecondaryCard } from "@/components/core/Card";
import { Dropdown } from "@/components/core/Dropdown";
import { HUD } from "@/components/core/HUD";
import { IconLabel } from "@/components/core/IconLabel";
import { Join } from "@/components/core/Join";
import { List } from "@/components/core/List";
import { Loader } from "@/components/core/Loader";
import { Modal } from "@/components/core/Modal";
import { NumberInput } from "@/components/core/NumberInput";
import { Progress } from "@/components/core/Progress";
import { PushButton } from "@/components/core/PushButton";
import { Range } from "@/components/core/Range";
import { Tabs } from "@/components/core/Tabs";
import { TextInput } from "@/components/core/TextInput";
import { Toggle } from "@/components/core/Toggle";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useState } from "react";
import { EntityType } from "@primodiumxyz/core";

export const _Sandbox = () => {
  const [dropdownValue, setDropdownValue] = useState(1);

  return (
    <HUD>
      <div className="absolute top-0 right-0 min-h-screen w-full heropattern-graphpaper-slate-800/50 bg-slate-900 p-10 grid grid-cols-2 gap-4 drop-shadow-hard pointer-events-auto">
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-secondary border" />
            <div className="w-8 h-8 bg-primary border" />
            <div className="w-8 h-8 bg-neutral border" />
            <div className="w-8 h-8 bg-base-100 border" />
            <div className="w-8 h-8 bg-accent border" />
            <div className="w-8 h-8 bg-error border" />
            <div className="w-8 h-8 bg-success border" />
            <div className="w-8 h-8 bg-info border" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="neutral" size="content" tooltip="test">
              🔥
              <SecondaryCard>
                <Range variant={"secondary"} />
                <CapacityBar current={50n} max={100n} segments={20} resourceType={EntityType.AegisDrone} />
              </SecondaryCard>
            </Button>
            <Button variant={"warning"}>warning</Button>
            <Button variant={"error"}>error</Button>
            <Button variant={"accent"}>accent</Button>
            <Button variant={"secondary"}>secondary</Button>
            <Button variant={"primary"}>primary</Button>
            <Button variant={"success"}>success</Button>
            <PushButton variant={"secondary"} size={"sm"} tooltip={"test"}>
              secondary
            </PushButton>
            <PushButton variant={"success"} size={"sm"} tooltip={"test"}>
              success
            </PushButton>
            <PushButton variant={"info"} size={"sm"} tooltip={"test"}>
              info
            </PushButton>
            <PushButton variant={"secondary"} size={"sm"} tooltip={"test"}>
              secondary
            </PushButton>
            <PushButton variant={"error"} size={"sm"} tooltip={"test"}>
              error
            </PushButton>
            <PushButton variant={"error"} size={"md"} tooltip={"test"}>
              error
            </PushButton>
          </div>
          <div className="flex gap-2">
            <Button size={"lg"}>Large</Button>
            <Button size={"md"}>Medium</Button>
            <Button size={"sm"}>Small</Button>
            <Button size={"xs"}>XSmall</Button>
          </div>
          <div className="flex gap-10">
            <Card className="w-72 h-72">
              <SecondaryCard>
                <PushButton variant={"secondary"} size={"sm"} className="w-32">
                  Claim
                </PushButton>
                <PushButton variant={"success"} size={"sm"} className="w-32">
                  Upgrade
                </PushButton>
                <PushButton variant={"error"} size={"sm"} tooltip={"attack"} className="w-32">
                  Attack
                </PushButton>
              </SecondaryCard>
            </Card>
            <Card className="w-32 h-32">Small Card</Card>
            <SecondaryCard className="w-32 h-32">Secondary Card</SecondaryCard>
          </div>
          <div>
            <Card>
              <Accordion>
                <Accordion.Item index={0}>
                  <Accordion.Title>Item 1</Accordion.Title>
                  <Accordion.Content>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed
                    cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum.
                    Praesent mauris.
                  </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item index={1}>
                  <Accordion.Title>Item 2 </Accordion.Title>
                  <Accordion.Content>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed
                    cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum.
                    Praesent mauris.
                  </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item index={2}>
                  <Accordion.Title>Item 3</Accordion.Title>
                  <Accordion.Content>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed
                    cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum.
                    Praesent mauris.
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion>
            </Card>
          </div>

          <Modal>
            <Modal.Button variant={"secondary"}>OPEN MODAL</Modal.Button>
            <Modal.Content className="w-96">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus
              ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent
              mauris.
            </Modal.Content>
          </Modal>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Range variant={"secondary"} />
            <Range variant={"primary"} />
            <Range variant={"warning"} />
            <Range variant={"success"} />
            <Range variant={"error"} />
            <Range variant={"info"} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Progress value={30} max={100} variant={"secondary"} />
            <Progress value={30} max={100} variant={"accent"} />
            <Progress max={100} variant={"accent"} />
            <Progress value={30} max={100} variant={"neutral"} />
            <Progress value={30} max={100} variant={"error"} />
            <Progress value={30} max={100} className="progress-info" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <CapacityBar current={50n} max={100n} segments={20} resourceType={EntityType.AegisDrone} />
            <CapacityBar current={50n} max={100n} segments={20} resourceType={EntityType.Electricity} />
          </div>
          <div className="flex gap-2">
            <Loader size="sm" />
            <Loader size="xs" />
          </div>
          <div className="flex gap-2">
            <Toggle defaultChecked className="toggle-xs toggle-primary" />
            <Toggle defaultChecked className="toggle-sm toggle-secondary" />
            <Toggle defaultChecked className="toggle-md toggle-accent" />
            <Toggle defaultChecked className="toggle-lg toggle-success" />
            <Toggle defaultChecked className="toggle-lg toggle-warning" />
            <Toggle defaultChecked className="toggle-lg toggle-info" />
          </div>
          <div className="flex gap-2">
            <Badge variant={"info"}>info</Badge>
            <Badge variant={"warning"}>warning</Badge>
            <Badge variant={"error"}>error</Badge>
            <Badge variant={"accent"}>accent</Badge>
            <Badge variant={"secondary"}>secondary</Badge>
            <Badge variant={"primary"}>primary</Badge>
            <Badge variant={"success"} tooltip={<IconLabel text="Debug Tooltip" imageUri={InterfaceIcons.Chat} />}>
              primary
            </Badge>
          </div>
          <Tabs defaultIndex={0}>
            <Join className="border border-secondary/50">
              <Tabs.Button index={0}>Tab1</Tabs.Button>
              <Tabs.Button index={1}>Tab2</Tabs.Button>
              <Tabs.Button index={2}>Tab3</Tabs.Button>
            </Join>
            <Tabs.Pane index={0}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus
              ante dapibus diam. Sed nisi.
            </Tabs.Pane>
            <Tabs.Pane index={1}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus
              ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent
              mauris.
            </Tabs.Pane>
            <Tabs.Pane index={2}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus
              ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent
              mauris. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed
              cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum.
              Praesent mauris.
            </Tabs.Pane>
            <Tabs.Pane index={3}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.</Tabs.Pane>
          </Tabs>
          <NumberInput count="0" />
          <TextInput placeholder="test" topRightLabel="Text input" />
          <Dropdown variant={"bottomLeft"} value={dropdownValue} onChange={setDropdownValue}>
            <Dropdown.Item value={1}>Test 1</Dropdown.Item>
            <Dropdown.Item value={2}>Test 2</Dropdown.Item>
            <Dropdown.Item value={3}>Test 3</Dropdown.Item>
          </Dropdown>
          <List>
            <List.Item>hello</List.Item>
            <List.Item active>active</List.Item>
            <List.Item strikethrough>strikethrough</List.Item>
          </List>
          <List ordered>
            <List.Item>hello</List.Item>
            <List.Item>goodbye</List.Item>
            <List.Item active>active</List.Item>
            <List.Item strikethrough>strikethrough</List.Item>
          </List>
        </div>
      </div>

      <HUD.CursorFollower className="ml-5">
        <Card noDecor>WOW 🎉</Card>
      </HUD.CursorFollower>
    </HUD>
  );
};
