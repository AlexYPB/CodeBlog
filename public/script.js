let deletePostForm = document.querySelector(".delete-post-form");

if (deletePostForm !== null) {

    deletePostForm.addEventListener("submit", function(event) {
        let confirmed = confirm("Are you sure you would like to delete this post?");

        if (confirmed === false) {
            event.preventDefault();
        }
    });
}