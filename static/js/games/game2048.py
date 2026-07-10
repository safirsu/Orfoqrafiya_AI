from flask import Blueprint, render_template


game2048_bp = Blueprint(
    "game2048",
    __name__
)


@game2048_bp.route("/oyunlar/2048")
def game2048():

    return render_template(
        "2048.html"
    )