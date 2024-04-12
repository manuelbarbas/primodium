import { Button } from "@/components/core/Button";
import { Card, SecondaryCard } from "@/components/core/Card";
import { Range } from "@/components/core/Range";
import { NumberInput } from "@/components/core/NumberInput";
import { EntityType } from "@/util/constants";
import { Accordion } from "@/components/core/Accordion";
import { Badge } from "@/components/core/Badge";
import { CapacityBar } from "@/components/core/CapacityBar";
import { HUD } from "@/components/core/HUD";
import { Join } from "@/components/core/Join";
import { Modal } from "@/components/core/Modal";
import { Progress } from "@/components/core/Progress";
import { Tabs } from "@/components/core/Tabs";
import { TextInput } from "@/components/core/TextInput";
import { Toggle } from "@/components/core/Toggle";
import { Loader } from "@/components/core/Loader";
import { IconLabel } from "@/components/core/IconLabel";

export const _Sandbox = () => {
  return (
    <HUD>
      <div className="absolute top-0 right-0 min-h-screen w-full grid-background bg-slate-900/45 p-10 grid grid-cols-2 gap-4 drop-shadow-hard">
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
            <Button variant={"info"} tooltip="test">
              info
            </Button>
            <Button variant={"warning"}>warning</Button>
            <Button variant={"error"}>error</Button>
            <Button variant={"accent"}>accent</Button>
            <Button variant={"secondary"}>secondary</Button>
            <Button variant={"primary"}>primary</Button>
            <Button variant={"success"}>primary</Button>
          </div>
          <div className="flex gap-2">
            <Button size={"lg"}>Large</Button>
            <Button size={"md"}>Medium</Button>
            <Button size={"sm"}>Small</Button>
            <Button size={"xs"}>XSmall</Button>
          </div>
          <div className="flex gap-2">
            <Card className="w-72 h-72">
              <SecondaryCard className="w-32 h-32">Large Card</SecondaryCard>
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
            <Range className="range-secondary" />
            <Range className="range-primary" />
            <Range className="range-warning" />
            <Range className="range-success" />
            <Range className="range-error" />
            <Range className="range-info" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Progress value={30} max={100} className="progress-secondary" />
            <Progress value={30} max={100} className="progress-primary" />
            <Progress value={30} max={100} className="progress-warning" />
            <Progress value={30} max={100} className="progress-success" />
            <Progress value={30} max={100} className="progress-error" />
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
            <Badge variant={"success"} tooltip={<IconLabel text="Debug Tooltip" imageUri="/img/icons/debugicon.png" />}>
              primary
            </Badge>
          </div>

          <Tabs defaultIndex={0}>
            <Join className="border border-secondary/50">
              <Tabs.Button showActive index={0}>
                Tab1
              </Tabs.Button>
              <Tabs.Button showActive index={1}>
                Tab2
              </Tabs.Button>
              <Tabs.Button showActive index={2}>
                Tab3
              </Tabs.Button>
            </Join>
            <Tabs.Pane index={0}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus
              ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent
              mauris.
            </Tabs.Pane>
            <Tabs.Pane index={1}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus
              ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent
              mauris.
            </Tabs.Pane>
            <Tabs.Pane index={2}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus
              ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent
              mauris.
            </Tabs.Pane>
            <Tabs.Pane index={3}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus
              ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent
              mauris.
            </Tabs.Pane>
          </Tabs>

          <NumberInput count="0" />
          <TextInput placeholder="test" topRightLabel="Text input" />
        </div>
      </div>

      <HUD.CursorFollower className="ml-5">
        <Card>WOW 🎉</Card>
      </HUD.CursorFollower>
    </HUD>
  );
};
