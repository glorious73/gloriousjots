$(document).ready(function() {
    $('#deleteModal').on('show.bs.modal', function (e) {
        var id = $(e.relatedTarget).data('id');
        $('#deleteButton').attr('onclick', 'deleteNote("'+id+'")');
        $(e.currentTarget).find(".modal-body").text('Are you sure you want to delete the note?');
    });
});

/**
 * This function takes a note id and deletes the associated note from the backend
 * @param {string} id 
 */
function deleteNote(id) {
    $.ajax({
        url: `/ideas/${id}`,
        type: 'DELETE',
        success: function(result) {
            window.location = '/ideas';
        },
        fail: function(xhr, textStatus, errorThrown) {
            alert('Could not delete note. Please try again.');
        }
    });
    // Redirect back to notes list
    window.location = '/ideas';
}