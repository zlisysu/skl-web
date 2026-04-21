from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from django.template.response import TemplateResponse

from wagtail.models import Page


FALLBACK_SEARCH_FIELDS = (
    "title",
    "seo_title",
    "search_description",
    "listing_title",
    "listing_summary",
    "plain_introduction",
    "summary",
    "research_areas",
    "responsible_team",
    "lab_name",
    "address",
    "contact_person",
    "office",
    "name_en",
    "academic_title",
    "position",
)


def _page_search_score(page, query):
    title = (getattr(page, "title", "") or "").lower()
    listing_title = (getattr(page, "listing_title", "") or "").lower()
    query = query.lower()

    score = 0
    if query in title:
        score += 120
    if query in listing_title:
        score += 90

    for field_name in FALLBACK_SEARCH_FIELDS[2:]:
        value = getattr(page, field_name, "") or ""
        if query in str(value).lower():
            score += 20

    return score


def _fallback_search(query):
    matches = []

    for page in Page.objects.live().public().specific():
        score = _page_search_score(page, query)
        if score > 0:
            matches.append(page)

    matches.sort(
        key=lambda item: (
            -_page_search_score(item, query),
            -(item.first_published_at.timestamp() if item.first_published_at else 0),
            item.title,
        )
    )
    return matches


def search(request):
    search_query = (request.GET.get("query") or "").strip()
    page = request.GET.get("page", 1)

    # Search
    if search_query:
        search_results = Page.objects.live().search(search_query)
        if not search_results:
            search_results = _fallback_search(search_query)
    else:
        search_results = Page.objects.none()

    # Pagination
    paginator = Paginator(search_results, 10)
    try:
        search_results = paginator.page(page)
    except PageNotAnInteger:
        search_results = paginator.page(1)
    except EmptyPage:
        search_results = paginator.page(paginator.num_pages)

    return TemplateResponse(
        request,
        "pages/search_view.html",
        {
            "search_query": search_query,
            "search_results": search_results,
            "SEO_NOINDEX": bool(
                search_query
            ),  # prevent google from indexing illicit search queries
        },
    )
