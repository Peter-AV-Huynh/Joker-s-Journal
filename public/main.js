const trash = document.getElementsByClassName("fa-solid fa-trash-can");

Array.from(trash).forEach(function (element) {
  element.addEventListener("click", function () {
    const logId = this.parentNode.childNodes[3].innerText;
    console.log(this.parentNode.childNodes[3].innerText);
    fetch("deleteLog", {
      method: "delete",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _id: logId,
      }),
    }).then(function (response) {
      window.location.reload();
    });
  });
});

document?.querySelector(".randomButton")?.addEventListener("click", function () {
  window.location.reload();
});

document?.querySelector(".followButton")?.addEventListener("click", function () {
  fetch("follows", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      followed_id: document.querySelector("#user_id").innerText,
    }),
  })
});
