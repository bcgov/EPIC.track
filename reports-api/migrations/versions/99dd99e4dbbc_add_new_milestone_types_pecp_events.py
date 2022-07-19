"""add new milestone types PECP events

Revision ID: 99dd99e4dbbc
Revises: f2071dc275f4
Create Date: 2022-07-19 14:08:26.514750

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import column,table


# revision identifiers, used by Alembic.
revision = '99dd99e4dbbc'
down_revision = 'f2071dc275f4'
branch_labels = None
depends_on = None


def upgrade():
    milestone_type_table = table('milestone_types',
        column('id',sa.Integer),
        column('name', sa.String),
    )

    milestones_table = table('milestones',
        column('id',sa.Integer),
        column('name', sa.String),
        column('kind', sa.String),
        column('phase_id', sa.Integer),
        column('milestone_type_id', sa.Integer),
        column('sort_order', sa.Integer),
        column('start_at', sa.Integer),
        column('duration', sa.Integer),
        column('auto', sa.Boolean),
    )

    staff_table = table('staffs',
        column('id', sa.Integer),
		column('name', sa.String),
		column('phone',sa.String),
		column('email', sa.String),
		column('is_active', sa.Boolean),
		column('position_id', sa.Integer)
    )

    new_milestone_types = ['PECP Coming', 'PECP Open', 'PECP Closing']

    op.bulk_insert(milestone_type_table, [
        {
            'name': m_type,
        } for m_type in new_milestone_types
    ])

    # Get the connection object for executing queries
    conn = op.get_bind()

    new_milestone_types = conn.execute(
        milestone_type_table.select()\
            .where(
                milestone_type_table.c.name.in_(new_milestone_types)
            )
        ).fetchall()
    for new_milestone_type in new_milestone_types:
        conn.execute(
            milestones_table.update()\
                .where(milestones_table.c.name.ilike(f'{new_milestone_type.name}%'))
                .values(**{'milestone_type_id': new_milestone_type.id})
        )
    staffs = [
        {
            
            "name" : "Anderson, Leith",
            "phone" : "778-698-9337",
            "email" : "Leith.Anderson@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Arend, Elenore",
            "phone" : "778 974-3009",
            "email" : "Elenore.Arend@gov.bc.ca",
            "is_active" : True,
            "position_id" : 1
        },
        {
            
            "name" : "Arnold, Chantal",
            "phone" : "236-478-2814",
            "email" : "Chantal.Arnold@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Ashcroft, Greg",
            "phone" : "250-554-7194",
            "email" : "Greg.Ashcroft@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Avila, Amy",
            "phone" : "778-698-7296",
            "email" : "Amy.Avila@gov.bc.ca",
            "is_active" : True,
            "position_id" : 3
        },
        {
            
            "name" : "Bailey, Scott",
            "phone" : "250-387-2307",
            "email" : "Scott.Bailey@gov.bc.ca",
            "is_active" : True,
            "position_id" : 2
        },
        {
            
            "name" : "Black, Brenda",
            "phone" : "250-649-4300",
            "email" : "Brenda.Black@gov.bc.ca",
            "is_active" : False,
            "position_id" : 7
        },
        {
            
            "name" : "Bojarski, Marla",
            "phone" : "250 489-8518",
            "email" : "Marla.Bojarski@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Bowes, Anna",
            "phone" : "778-698-9339",
            "email" : "Anna.Bowes@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Braun, Nathan",
            "phone" : "778-698-9280",
            "email" : "Nathan.Braun@gov.bc.ca",
            "is_active" : False,
            "position_id" : 3
        },
        {
            
            "name" : "Brix, Raluca",
            "phone" : "778 698-9825",
            "email" : "Raluca.Brix@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Cabaltera, Jewel",
            "phone" : "236-478-2813",
            "email" : "Jewel.Cabaltera@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Carter, Lori",
            "phone" : "778 698-5093",
            "email" : "Lori.Carter@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Casponi, Giovanni",
            "phone" : "250-555-1212",
            "email" : "Giovanni.Casponi@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Chace, Julie",
            "phone" : "778-698-7289",
            "email" : "Julie.Chace@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Chapman, Chloe",
            "phone" : "250 978-9654",
            "email" : "Chloe.Chapman@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Conrod, Stephanie",
            "phone" : "778-698-0489",
            "email" : "Stephanie.Conrod@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Darling, May",
            "phone" : "778-698-9341",
            "email" : "May.Darling@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Dowling, Alaina",
            "phone" : "236-478-2812",
            "email" : "Alaina.Dowling@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Duggan, Sarah",
            "phone" : "778 698-4761",
            "email" : "Sarah.Duggan@gov.bc.ca",
            "is_active" : True,
            "position_id" : 4
        },
        {
            
            "name" : "Farnsworth, Emily",
            "phone" : "236-478-1285",
            "email" : "Emily.Farnsworth@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Fekete, Warren",
            "phone" : "778-698-9349",
            "email" : "Warren.Fekete@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Fenton, Chrystal",
            "phone" : "778-974-2837",
            "email" : "Chrystal.Fenton@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Ferbey, Stasia",
            "phone" : "778 698-7161",
            "email" : "Stasia.Ferbey@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Foote, Sheldon",
            "phone" : "778-698-9329",
            "email" : "Sheldon.Foote@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Foskey, Paul",
            "phone" : "236-478-1914",
            "email" : "Paul.Foskey@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Frechette, Shayla",
            "phone" : "778-974-4059",
            "email" : "Shayla.Frechette@gov.bc.ca",
            "is_active" : False,
            "position_id" : 7
        },
        {
            
            "name" : "Garside, Chelsea",
            "phone" : "778-698-9307",
            "email" : "Chelsea.Garside@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Gibson, Heidi",
            "phone" : "236-478-0915",
            "email" : "Heidi.Gibson@gov.bc.ca",
            "is_active" : False,
            "position_id" : 3
        },
        {
            
            "name" : "Goodsell , Todd",
            "phone" : "778-696-2125",
            "email" : "Todd.Goodsell@gov.bc.ca",
            "is_active" : True,
            "position_id" : 4
        },
        {
            
            "name" : "Gough, Claire",
            "phone" : "250-555-1212",
            "email" : "Claire.Gough@gov.bc.ca",
            "is_active" : True,
            "position_id" : 4
        },
        {
            
            "name" : "Grace, David",
            "phone" : "778-698-9310",
            "email" : "David.Grace@gov.bc.ca",
            "is_active" : True,
            "position_id" : 4
        },
        {
            
            "name" : "Green, Andrew",
            "phone" : "778-974-3500",
            "email" : "Andrew.1.Green@gov.bc.ca",
            "is_active" : True,
            "position_id" : 4
        },
        {
            
            "name" : "Green, Tessa",
            "phone" : "236-478-3564",
            "email" : "Tessa.Green@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Greene Hill, Carly",
            "phone" : "(236) 478-3255",
            "email" : "Carly.GreeneHill@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Haines, Mark",
            "phone" : "778-698-9320",
            "email" : "Mark.Haines@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Hannigan, Jessie",
            "phone" : "236-478-3009",
            "email" : "Jessie.Hannigan@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Hardie, Karie",
            "phone" : "778-698-9287",
            "email" : "Karie.Hardie@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Harris, Jessica",
            "phone" : "778-698-9344",
            "email" : "Jessica.Harris@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Harvie, Jennifer",
            "phone" : "236-478-0607",
            "email" : "Jennifer.Harvie@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Hazelbower, Joshua",
            "phone" : "236 478-3287",
            "email" : "Joshua.Hazelbower@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Hoyle, Meaghan",
            "phone" : "778-974-3361",
            "email" : "Meaghan.Hoyle@gov.bc.ca",
            "is_active" : True,
            "position_id" : 4
        },
        {
            
            "name" : "Hubert, Edwin",
            "phone" : "778-698-9323",
            "email" : "Edwin.Hubert@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Hutchison, Brennan",
            "phone" : "778-698-9315",
            "email" : "Brennan.Hutchison@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Janes, Tracey",
            "phone" : "236-969-0582",
            "email" : "Tracey.Janes@gov.bc.ca",
            "is_active" : True,
            "position_id" : 4
        },
        {
            
            "name" : "Karmona, Jennifer",
            "phone" : "778-974-4558",
            "email" : "Jennifer.Karmona@gov.bc.ca",
            "is_active" : True,
            "position_id" : 4
        },
        {
            
            "name" : "Loiacono, Sabrina",
            "phone" : "778-698-9290",
            "email" : "Sabrina.Loiacono@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Lombardi, Christie",
            "phone" : "250-475-7428",
            "email" : "Christie.Lombardi@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Luke, Lindsay",
            "phone" : "778-698-9308",
            "email" : "Lindsay.Luke@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "MacLellan, Kris",
            "phone" : "778-974-4851",
            "email" : "Kris.MacLellan@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Martin, Jillian",
            "phone" : "236 478-3729",
            "email" : "Jillian.Martin@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Martinez-Dussan, Mabel",
            "phone" : "236 478-3262",
            "email" : "Mabel.MartinezDussan@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Mather, Brendan",
            "phone" : "250-952-1340",
            "email" : "Brendan.Mather@gov.bc.ca",
            "is_active" : True,
            "position_id" : 4
        },
        {
            
            "name" : "Matzanke, Elise",
            "phone" : "236-478-2172",
            "email" : "Elise.Matzanke@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "May-Poole, Tanner",
            "phone" : "778 698-9185",
            "email" : "Tanner.MayPoole@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "McDonald, Geoff",
            "phone" : "778-698-9345",
            "email" : "Geoff.L.McDonald@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "McLean, Alex",
            "phone" : "250-344-7513",
            "email" : "Alex.D.McLean@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "McNaughton, Steve",
            "phone" : "778-698-9332",
            "email" : "Steve.McNaughton@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Merrigan, Breanna",
            "phone" : "778-698-9474",
            "email" : "Breanna.Merrigan@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Morrison, Alli",
            "phone" : "778-698-9291",
            "email" : "Alli.Morrison@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Motisca, Dan",
            "phone" : "778-698-9316",
            "email" : "Dan.Motisca@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Murphy, Shelley",
            "phone" : "778-698-9311",
            "email" : "Shelley.Murphy@gov.bc.ca",
            "is_active" : False,
            "position_id" : 3
        },
        {
            
            "name" : "Noble, Heather",
            "phone" : "778-698-9334",
            "email" : "Heather.Noble@gov.bc.ca",
            "is_active" : True,
            "position_id" : 4
        },
        {
            
            "name" : "Ortiz, Erick",
            "phone" : "778-974-2811",
            "email" : "Erick.Ortiz@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Ostman, Kyle",
            "phone" : "778-698-8207",
            "email" : "Kyle.Ostman@gov.bc.ca",
            "is_active" : True,
            "position_id" : 6
        },
        {
            
            "name" : "Parks, Chris",
            "phone" : "778-698-9325",
            "email" : "Chris.Parks@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Paulson, Amber",
            "phone" : "778-974-4858",
            "email" : "Amber.Paulson@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Pennell, Rachel",
            "phone" : "778-364-1222",
            "email" : "Rachel.Pennell@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Pizarro, Kirsten",
            "phone" : "778-698-9302",
            "email" : "Kirsten.Pizarro@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Prsala, James",
            "phone" : "778-698-7290",
            "email" : "James.Prsala@gov.bc.ca",
            "is_active" : True,
            "position_id" : 4
        },
        {
            
            "name" : "Rathbone, Mary",
            "phone" : "778-698-9285",
            "email" : "Mary.Rathbone@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Rice, Kyle",
            "phone" : "778-698-9284",
            "email" : "Kyle.Rice@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Robinson, Tiffany",
            "phone" : "250-419-8639",
            "email" : "Tiffany.Robinson@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Rodgers, Matthew",
            "phone" : "778-698-9319",
            "email" : "Matthew.Rodgers@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Salzer, Beth-Anne",
            "phone" : "250-475-7482",
            "email" : "BethAnne.Salzer@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Shepard, Mike",
            "phone" : "778-698-9294",
            "email" : "Michael.Shepard@gov.bc.ca",
            "is_active" : True,
            "position_id" : 3
        },
        {
            
            "name" : "Smith, Clayton",
            "phone" : "250-649-4299",
            "email" : "Clayton.H.Smith@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Smyth, Danielle",
            "phone" : "778-648-2037",
            "email" : "Danielle.Smyth@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Spiteri, Bailey",
            "phone" : "778-698-9281",
            "email" : "Bailey.Spiteri@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "St. James, Katherine",
            "phone" : "778-698-9338",
            "email" : "Katherine.StJames@gov.bc.ca",
            "is_active" : True,
            "position_id" : 4
        },
        {
            
            "name" : "Stockman, Fern",
            "phone" : "778-698-9313",
            "email" : "Fern.Stockman@gov.bc.ca",
            "is_active" : True,
            "position_id" : 3
        },
        {
            
            "name" : "Stuart, Gareth",
            "phone" : "236-478-0829",
            "email" : "Gareth.Stuart@gov.bc.ca",
            "is_active" : True,
            "position_id" : 4
        },
        {
            
            "name" : "Thede, Amy",
            "phone" : "778-698-4287",
            "email" : "Amy.Thede@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Thiessen, Bethany",
            "phone" : "236-478-0492",
            "email" : "Bethany.Thiessen@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Thompson, Josh",
            "phone" : "778 698-9299",
            "email" : "Josh.Thompson@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Thomson, Craig",
            "phone" : "778 974-2990",
            "email" : "Craig.Thomson@gov.bc.ca",
            "is_active" : True,
            "position_id" : 7
        },
        {
            
            "name" : "Van Doorn, Mark",
            "phone" : "778 698-9292",
            "email" : "Mark.VanDoorn@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "Walters, Kim",
            "phone" : "778-698-3398",
            "email" : "Kimberly.Walters@gov.bc.ca",
            "is_active" : True,
            "position_id" : 3
        },
        {
            
            "name" : "Warner, Jessica",
            "phone" : "778-974-3440",
            "email" : "Jessica.Warner@gov.bc.ca",
            "is_active" : True,
            "position_id" : 6
        },
        {
            
            "name" : "Westaff, Melissa",
            "phone" : "778-698-1426",
            "email" : "Melissa.Westaff@gov.bc.ca",
            "is_active" : True,
            "position_id" : 6
        },
        {
            
            "name" : "Wittig, Greg",
            "phone" : "778 698-9282",
            "email" : "Gregory.Wittig@gov.bc.ca",
            "is_active" : True,
            "position_id" : 6
        },
        {
            
            "name" : "Zavediuk, Jillian",
            "phone" : "778-698-3980",
            "email" : "Jillian.Zavediuk@gov.bc.ca",
            "is_active" : True,
            "position_id" : 5
        },
        {
            
            "name" : "James, Tracy",
            "phone" : "250-555-1212",
            "email" : "Tracy.James@gov.bc.ca",
            "is_active" : True,
            "position_id" : 3
        }
    ]
    op.bulk_insert(staff_table, staffs)


def downgrade():
    pass
