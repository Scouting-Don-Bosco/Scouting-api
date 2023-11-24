export function TagSorter(a, b) {
  const tagsInOrder = ["index", "auth", "members", "groups", "users"];

  if (tagsInOrder.indexOf(a) > tagsInOrder.indexOf(b)) {
    return 1;
  } else if (tagsInOrder.indexOf(a) < tagsInOrder.indexOf(b)) {
    return -1;
  } else {
    return 0;
  }
}

export function OperationSorter(a, b) {
  const operationsInOrder = [
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "options",
  ];

  const methodA = a.get("method");
  const methodB = b.get("method");

  console.log(methodA, methodB);

  if (operationsInOrder.indexOf(methodA) > operationsInOrder.indexOf(methodB)) {
    return 1;
  } else if (
    operationsInOrder.indexOf(methodA) < operationsInOrder.indexOf(methodB)
  ) {
    return -1;
  } else {
    return 0;
  }
}
