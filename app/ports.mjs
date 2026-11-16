import {EQUIPMENT} from './catalog.mjs';

/** Known housing identifiers are retained even when the installed output is unverified. */
export function portInfo(node) {
 const model=EQUIPMENT[node?.modelId];
 const main=model?.ports||[],known=model?.knownPhysicalPorts||main;
 const optional=model?.optionalPhysicalPorts||[];
 const confirmed=Array.isArray(node?.settings?.optionalPortsConfirmed)?node.settings.optionalPortsConfirmed:[];
 const enabled=[...main,...optional.filter(port=>confirmed.includes(port)&&!main.includes(port))];
 return {known:[...known],enabled,unverified:known.filter(port=>!enabled.includes(port))};
}
export const enabledPorts=node=>portInfo(node).enabled;
