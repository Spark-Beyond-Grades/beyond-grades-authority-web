export function participantUploadPlan(structureEditable) {
  return { saveFormFirst: structureEditable === true };
}

export function csvFileFromList(files) {
  const file = files?.[0];
  return file || null;
}
