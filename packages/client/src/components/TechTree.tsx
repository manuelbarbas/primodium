import { useState } from "react";

import ReactFlow from "reactflow";
import "reactflow/dist/base.css";

import TechTreeNode from "./TechTreeNode";

import { FaWindowClose } from "react-icons/fa";

function TechTree() {
  const nodeTypes = { techTree: TechTreeNode };
  const initialNodes = [
    {
      id: "1",
      type: "techTree",
      data: {
        name: "Main base",
        // description: "The headquarters of your operation.",
        thumbnail: (
          <img
            src="/img/building/mainbase.gif"
            style={{ imageRendering: "pixelated" }}
            className="w-5 h-5"
          />
        ),
        cost: (
          <>
            <span className="mr-2">
              <img
                src="/img/resource/iron_ore_layer.png"
                className="w-4 h-4 inline-block mr-1"
              />
              200
            </span>
            <span className="mr-2">
              <img
                src="/img/resource/copper_ore_layer.png"
                className="w-4 h-4 inline-block mr-1"
              />
              100
            </span>
          </>
        ),
      },
      position: { x: 150, y: 50 },
    },
    {
      id: "2",
      type: "techTree",
      data: {
        name: "Basic miner",
        // description: "Mines iron, copper, lithium, and titanium.",
        thumbnail: (
          <img
            src="/img/building/minerdrill.gif"
            style={{ imageRendering: "pixelated" }}
            className="w-5 h-5"
          />
        ),
        cost: (
          <>
            <span className="mr-2">
              <img
                src="/img/resource/iron_ore_layer.png"
                className="w-4 h-4 inline-block mr-1"
              />
              200
            </span>
            <span className="mr-2">
              <img
                src="/img/resource/copper_ore_layer.png"
                className="w-4 h-4 inline-block mr-1"
              />
              100
            </span>
          </>
        ),
      },
      position: { x: 250, y: 275 },
    },
    {
      id: "3",
      type: "techTree",
      data: {
        name: "Transport node",
        // description: "Transports everything you mine or produce.",
        thumbnail: (
          <img
            src="/img/building/node.gif"
            style={{ imageRendering: "pixelated" }}
            className="w-5 h-5"
          />
        ),
        cost: (
          <>
            <span className="mr-2">
              <img
                src="/img/resource/iron_ore_layer.png"
                className="w-4 h-4 inline-block mr-1"
              />
              200
            </span>
            <span className="mr-2">
              <img
                src="/img/resource/copper_ore_layer.png"
                className="w-4 h-4 inline-block mr-1"
              />
              100
            </span>
          </>
        ),
      },
      position: { x: 50, y: 275 },
    },
    {
      id: "3",
      type: "techTree",
      data: {
        name: "Transport node",
        // description: "Transports everything you mine or produce.",
        thumbnail: (
          <img
            src="/img/building/node.gif"
            style={{ imageRendering: "pixelated" }}
            className="w-5 h-5"
          />
        ),
        cost: (
          <>
            <span className="mr-2">
              <img
                src="/img/resource/iron_ore_layer.png"
                className="w-4 h-4 inline-block mr-1"
              />
              200
            </span>
            <span className="mr-2">
              <img
                src="/img/resource/copper_ore_layer.png"
                className="w-4 h-4 inline-block mr-1"
              />
              100
            </span>
          </>
        ),
      },
      position: { x: 50, y: 275 },
    },
    {
      id: "4",
      type: "techTree",
      data: {
        name: "Conveyor",
        // description: "Connects between nodes.",
        thumbnail: (
          <img
            src="/img/building/node.gif"
            style={{ imageRendering: "pixelated" }}
            className="w-5 h-5"
          />
        ),
        cost: (
          <>
            <span className="mr-2">
              <img
                src="/img/resource/iron_ore_layer.png"
                className="w-4 h-4 inline-block mr-1"
              />
              200
            </span>
            <span className="mr-2">
              <img
                src="/img/resource/copper_ore_layer.png"
                className="w-4 h-4 inline-block mr-1"
              />
              100
            </span>
          </>
        ),
      },
      position: { x: -150, y: 275 },
    },
    {
      id: "5",
      type: "techTree",
      data: {
        name: "Iron",
        // description: "A basic resource used in a lot of recipes.",
        thumbnail: (
          <img
            src="/img/resource/iron_ore_layer.png"
            style={{ imageRendering: "pixelated" }}
            className="w-5 h-5"
          />
        ),
        cost: (
          <>
            <span className="mr-2">
              <img
                src="/img/resource/iron_ore_layer.png"
                className="w-4 h-4 inline-block mr-1"
              />
              200
            </span>
            <span className="mr-2">
              <img
                src="/img/resource/copper_ore_layer.png"
                className="w-4 h-4 inline-block mr-1"
              />
              100
            </span>
          </>
        ),
      },
      position: { x: 450, y: 275 },
    },
    // { id: "5", position: { x: 225, y: 100 }, data: { label: "Iron" } },
    // { id: "6", position: { x: 0, y: 200 }, data: { label: "Copper" } },
    // {
    //   id: "7",
    //   position: { x: 0, y: 300 },
    //   data: { label: "Plating factory" },
    // },
    // { id: "8", position: { x: 0, y: 400 }, data: { label: "Lithium" } },
    // {
    //   id: "9",
    //   position: { x: 0, y: 500 },
    //   data: { label: "Basic battery factory" },
    // },
    // {
    //   id: "10",
    //   position: { x: 0, y: 600 },
    //   data: { label: "Kninetic missile factory" },
    // },
    // { id: "11", position: { x: 0, y: 100 }, data: { label: "Titanium" } },
    // {
    //   id: "12",
    //   position: { x: 0, y: 100 },
    //   data: { label: "Projectile silo" },
    // },
    // { id: "13", position: { x: 0, y: 100 }, data: { label: "Hardened drill" } },
    // { id: "14", position: { x: 0, y: 100 }, data: { label: "Osmium" } },
    // {
    //   id: "15",
    //   position: { x: 0, y: 100 },
    //   data: { label: "Dense metal refinery" },
    // },
    // {
    //   id: "16",
    //   position: { x: 0, y: 100 },
    //   data: { label: "Advanced battery factory" },
    // },
    // { id: "17", position: { x: 0, y: 100 }, data: { label: "Tungsten" } },
    // {
    //   id: "18",
    //   position: { x: 0, y: 100 },
    //   data: { label: "Penetrator factory" },
    // },
    // {
    //   id: "19",
    //   position: { x: 0, y: 100 },
    //   data: { label: "Penetrating missile factory" },
    // },
    // {
    //   id: "20",
    //   position: { x: 0, y: 100 },
    //   data: { label: "Missile launch complex" },
    // },
    // {
    //   id: "21",
    //   position: { x: 0, y: 100 },
    //   data: { label: "High-energy laser factory" },
    // },
    // {
    //   id: "22",
    //   position: { x: 0, y: 100 },
    //   data: { label: "Thermobaric warhead" },
    // },
    // {
    //   id: "23",
    //   position: { x: 0, y: 100 },
    //   data: { label: "Thermobaric warhead factory" },
    // },
    // {
    //   id: "24",
    //   position: { x: 0, y: 100 },
    //   data: { label: "High-temp foundry" },
    // },
    // {
    //   id: "25",
    //   position: { x: 0, y: 100 },
    //   data: { label: "Iridium" },
    // },
    // {
    //   id: "26",
    //   position: { x: 0, y: 100 },
    //   data: { label: "Precision machinery factory" },
    // },
    // {
    //   id: "27",
    //   position: { x: 0, y: 100 },
    //   data: { label: "Iridium drillbit factory" },
    // },
    // {
    //   id: "28",
    //   position: { x: 0, y: 100 },
    //   data: { label: "Precision pneumatic drill" },
    // },
    // {
    //   id: "29",
    //   position: { x: 0, y: 100 },
    //   data: { label: "Kimberlite" },
    // },
  ];

  const initialEdges = [
    { id: "e1-2", source: "1", target: "2" },
    { id: "e1-3", source: "1", target: "3" },
    { id: "e1-4", source: "1", target: "4" },
    { id: "e1-5", source: "1", target: "5" },
    // { id: "e2-6", source: "2", target: "6" },
    // { id: "e3-6", source: "3", target: "6" },
    // { id: "e4-6", source: "4", target: "6" },
    // { id: "e5-6", source: "5", target: "6" },
    // { id: "e6-7", source: "6", target: "7" },
    // { id: "e7-8", source: "7", target: "8" },
    // { id: "e8-9", source: "8", target: "9" },
    // { id: "e9-10", source: "9", target: "10" },
  ];
  const proOptions = { hideAttribution: true };

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        proOptions={proOptions}
        nodeTypes={nodeTypes}
        fitView
      />
    </div>
  );
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block align-middle">{icon}</div>
);

export default TechTree;
