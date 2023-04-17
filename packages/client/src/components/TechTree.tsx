import { useState } from "react";
import React, { useCallback } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
} from "reactflow";

import "reactflow/dist/base.css";

import TechTreeNode from "./TechTreeNode";

import { FaWindowClose } from "react-icons/fa";

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
  {
    id: "6",
    type: "techTree",
    data: {
      name: "Copper",
      thumbnail: (
        <img
          src="/img/resource/copper_ore_layer.png"
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
    position: { x: 150, y: 500 },
  },
  {
    id: "7",
    type: "techTree",
    data: {
      name: "Plating factory",
      thumbnail: (
        <img
          src="/img/resource/node.gif"
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
    position: { x: 150, y: 725 },
  },
  {
    id: "8",
    type: "techTree",
    data: {
      name: "Lithium",
      thumbnail: (
        <img
          src="/img/resource/lithium_ore_layer.png"
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
    position: { x: 150, y: 950 },
  },
  {
    id: "9",
    type: "techTree",
    data: {
      name: "Basic battery factory",
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
    position: { x: 150, y: 1175 },
  },
  {
    id: "10",
    type: "techTree",
    data: {
      name: "Titanium",
      thumbnail: (
        <img
          src="/img/resource/titanium_ore_layer.png"
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
    position: { x: 250, y: 1400 },
  },
  {
    id: "11",
    type: "techTree",
    data: {
      name: "Kinetic missile factory",
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
    position: { x: 50, y: 1400 },
  },
  {
    id: "12",
    type: "techTree",
    data: {
      name: "Projectile silo",
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
    position: { x: 150, y: 1625 },
  },
  {
    id: "13",
    type: "techTree",
    data: {
      name: "Hardened drill",
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
    position: { x: 350, y: 1625 },
  },
  {
    id: "14",
    type: "techTree",
    data: {
      name: "Osmium",
      thumbnail: (
        <img
          src="/img/resource/osmium_ore_layer.png"
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
    position: { x: 350, y: 1850 },
  },
  {
    id: "15",
    type: "techTree",
    data: {
      name: "Dense metal refinery",
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
    position: { x: 350, y: 2075 },
  },
  {
    id: "16",
    type: "techTree",
    data: {
      name: "Advanced power factory",
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
    position: { x: 350, y: 2300 },
  },
  {
    id: "17",
    type: "techTree",
    data: {
      name: "Tungsten",
      thumbnail: (
        <img
          src="/img/resource/tungsten_ore_layer.png"
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
    position: { x: 250, y: 2525 },
  },
  {
    id: "18",
    type: "techTree",
    data: {
      name: "Penetrator factory",
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
    position: { x: 450, y: 2525 },
  },
  {
    id: "19",
    type: "techTree",
    data: {
      name: "Penetrating missile factory",
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
    position: { x: 450, y: 2750 },
  },
  {
    id: "20",
    type: "techTree",
    data: {
      name: "Missile launch complex",
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
    position: { x: 450, y: 2975 },
  },
  {
    id: "21",
    type: "techTree",
    data: {
      name: "High-energy laser factory",
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
    position: { x: 550, y: 3200 },
  },
  {
    id: "22",
    type: "techTree",
    data: {
      name: "Thermobaric warhead factory",
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
    position: { x: 350, y: 3200 },
  },
  {
    id: "23",
    type: "techTree",
    data: {
      name: "Thermobaric missile factory",
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
    position: { x: 350, y: 3425 },
  },
  {
    id: "24",
    type: "techTree",
    data: {
      name: "High-temp foundry",
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
    position: { x: 250, y: 2750 },
  },
  {
    id: "25",
    type: "techTree",
    data: {
      name: "Iridium",
      thumbnail: (
        <img
          src="/img/resource/iridium_ore_layer.png"
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
    position: { x: 250, y: 2975 },
  },
  {
    id: "26",
    type: "techTree",
    data: {
      name: "Precision machinery factory",
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
    position: { x: 150, y: 3200 },
  },
  {
    id: "27",
    type: "techTree",
    data: {
      name: "Iridium drillbit factory",
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
    position: { x: 150, y: 3425 },
  },
  {
    id: "28",
    type: "techTree",
    data: {
      name: "Precision pneumatic drill",
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
    position: { x: 150, y: 3650 },
  },
  {
    id: "29",
    type: "techTree",
    data: {
      name: "Kimberlite",
      thumbnail: (
        <img
          src="/img/resource/kimberlite_ore_layer.png"
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
    position: { x: 150, y: 3875 },
  },
  {
    id: "30",
    type: "techTree",
    data: {
      name: "Kimberlite catalyst factory",
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
    position: { x: 150, y: 4100 },
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e1-3", source: "1", target: "3" },
  { id: "e1-4", source: "1", target: "4" },
  { id: "e1-5", source: "1", target: "5" },
  { id: "e2-6", source: "2", target: "6" },
  { id: "e3-6", source: "3", target: "6" },
  { id: "e4-6", source: "4", target: "6" },
  { id: "e5-6", source: "5", target: "6" },
  { id: "e6-7", source: "6", target: "7" },
  { id: "e7-8", source: "7", target: "8" },
  { id: "e8-9", source: "8", target: "9" },
  { id: "e9-10", source: "9", target: "10" },
  { id: "e9-11", source: "9", target: "11" },
  { id: "e10-12", source: "10", target: "12" },
  { id: "e10-13", source: "10", target: "13" },
  { id: "e13-14", source: "13", target: "14" },
  { id: "e14-15", source: "14", target: "15" },
  { id: "e15-16", source: "15", target: "16" },
  { id: "e16-17", source: "16", target: "17" },
  { id: "e16-18", source: "16", target: "18" },
  { id: "e18-19", source: "18", target: "19" },
  { id: "e19-20", source: "19", target: "20" },
  { id: "e20-21", source: "20", target: "21" },
  { id: "e20-22", source: "20", target: "22" },
  { id: "e22-23", source: "22", target: "23" },
  { id: "e17-24", source: "17", target: "24" },
  { id: "e24-25", source: "24", target: "25" },
  { id: "e25-26", source: "25", target: "26" },
  { id: "e26-27", source: "26", target: "27" },
  { id: "e27-28", source: "27", target: "28" },
  { id: "e28-29", source: "28", target: "29" },
  { id: "e29-30", source: "29", target: "30" },
];
const proOptions = { hideAttribution: true };

function TechTree() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

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
