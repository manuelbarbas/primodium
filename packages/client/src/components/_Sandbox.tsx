import { Button } from "src/components/core/Button";
import { Card, SecondaryCard } from "./core/Card";
import { Range } from "./core/Range";
import { Loader } from "./core/Loader";
import { Toggle } from "./core/Toggle";
import { Badge } from "./core/Badge";
import { Progress } from "./core/Progress";
import { Accordion } from "./core/Accordion";
import { Tabs } from "./core/Tabs";
import { Join } from "./core/Join";
import { CapacityBar } from "./core/CapacityBar";
import { EntityType } from "src/util/constants";
import { NumberInput } from "./core/NumberInput";
import { HUD } from "./core/HUD";
import { Modal } from "./core/Modal";

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
          <div className="flex gap-2">
            <Button className="bg-error">Error</Button>
            <Button className="bg-warning">Error</Button>
            <Button className="bg-success">Error</Button>
            <Button className="bg-secondary">Secondary</Button>
            <Button className="bg-primary">Primary</Button>
          </div>
          <div className="flex gap-2">
            <Button className="bg-primary btn-lg">Large</Button>
            <Button className="bg-primary btn-md">Medium</Button>
            <Button className="bg-primary btn-sm">Small</Button>
            <Button className="bg-primary btn-xs">XSmall</Button>
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
            <Modal.Button className="btn-secondary">OPEN MODAL</Modal.Button>
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
            <Badge className="badge-neutral">Badge</Badge>
            <Badge className="badge-primary">Badge</Badge>
            <Badge className="badge-accent">Badge</Badge>
            <Badge className="badge-success">Badge</Badge>
            <Badge className="badge-warning badge">Badge</Badge>
            <Badge className="badge-info">Badge</Badge>
            <Badge className="badge-accent badge-outline">Badge</Badge>
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
          </Tabs>

          <NumberInput count="0" />
        </div>
      </div>

      <HUD.CursorFollower className="ml-5">
        <Card>🎉</Card>
      </HUD.CursorFollower>
    </HUD>
  );
};
